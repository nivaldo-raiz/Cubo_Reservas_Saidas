import { expect, test, type Page } from "playwright/test";
import { readFile } from "node:fs/promises";

test.describe.configure({ mode: "serial" });

async function loginGuardian(page: Page, account: "paid" | "pending" = "paid") {
  await page.goto("/acesso");
  await page.waitForTimeout(750);
  await page.getByLabel("E-mail do responsável").fill(
    account === "pending" ? "pendente@example.com" : "familia@example.com",
  );
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(
    account === "pending" ? /\/pagamento-pendente$/ : /\/alunos$/,
  );
}

test("landing preserva composição desktop e mobile", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Sua jornada começa antes do embarque." })).toBeVisible();
  await page.screenshot({ path: "tmp/home-desktop.png", fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.getByText("18 a 22 de novembro")).toBeVisible();
  await page.screenshot({ path: "tmp/home-mobile.png", fullPage: true });
});

test("e-mail não cadastrado não libera autenticação", async ({ page }) => {
  await page.goto("/acesso");
  await page.waitForTimeout(750);
  await page.getByLabel("E-mail do responsável").fill("nao-cadastrado@example.com");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("Você não é um responsável autorizado.", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/acesso$/);
});

test("responsável pago confirma documentação e assento", async ({ page }) => {
  await loginGuardian(page);
  await expect(page).toHaveURL(/\/alunos$/);
  await page.getByRole("link", { name: "Escolher assento" }).first().click();
  await page.waitForLoadState("networkidle");
  await page.getByRole("checkbox").check();
  const continueButton = page.getByRole("button", { name: "Continuar" });
  await expect(continueButton).toBeEnabled();
  await continueButton.click();
  await page.getByRole("button", { name: "Assento 03, disponível" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Confirmar assento" }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Finalizar" }).click();
  await expect(page.getByRole("heading", { name: "Assento confirmado" })).toBeVisible();
});

test("responsável pendente recebe bloqueio explicativo", async ({ page }) => {
  await loginGuardian(page, "pending");
  await expect(page).toHaveURL(/\/pagamento-pendente$/);
  await expect(page.getByRole("heading", { name: "Pagamento pendente" })).toBeVisible();
  await expect(page.getByText(/Seu acesso ainda está aguardando liberação/)).toBeVisible();
  await expect(page.getByText(/A escolha de assento será liberada/)).toHaveCount(0);
});

test("admin altera pagamento", async ({ page }) => {
  const adminPassword = process.env.DEMO_ADMIN_PASSWORD;
  test.skip(!adminPassword, "DEMO_ADMIN_PASSWORD não configurada no runner E2E.");
  await page.goto("/admin-acesso");
  await page.waitForTimeout(750);
  await page.getByLabel("E-mail").fill("admin@example.cubo.global");
  await page.getByLabel("Senha").fill(adminPassword!);
  await page.getByRole("button", { name: "Entrar no painel" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  const pendingRow = page.getByRole("row").filter({ hasText: "Rafael Santos" });
  await pendingRow.getByRole("button", { name: "Marcar pago" }).click();
  await expect(pendingRow.getByText("Pago", { exact: true })).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Exportar planilha" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^cubo-viagem-\d{4}-\d{2}-\d{2}\.csv$/);
  const downloadPath = await download.path();
  expect(downloadPath).toBeTruthy();
  const contents = await readFile(downloadPath!, "utf8");
  expect(contents).toContain('"Telefone do responsável"');
  expect(contents).toContain('"(21) 99999-1111"');
  expect(contents).not.toContain('"ID do aluno"');
  expect(contents).not.toContain('"ID do responsável"');
  expect(contents).not.toContain('"ID do ônibus"');
  expect(contents).not.toContain('"ID do assento"');
});
