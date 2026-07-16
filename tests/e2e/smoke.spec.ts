import { expect, test, type Page } from "playwright/test";

test.describe.configure({ mode: "serial" });

async function loginGuardian(page: Page, account: "paid" | "pending" = "paid") {
  await page.goto("/acesso");
  await page.waitForTimeout(750);
  await page.getByLabel("E-mail do responsável").fill(
    account === "pending" ? "pendente@example.com" : "familia@example.com",
  );
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText("E-mail autorizado:")).toBeVisible();
  await page.getByRole("link", { name: "Entrar na demonstração" }).click();
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
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText("Você não é um responsável autorizado.", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Entrar na demonstração" })).toHaveCount(0);
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
});
