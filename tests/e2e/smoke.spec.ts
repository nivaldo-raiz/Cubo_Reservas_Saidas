import { expect, test, type Page } from "playwright/test";

test.describe.configure({ mode: "serial" });

async function loginGuardian(page: Page, email: string) {
  await page.goto("/acesso");
  await page.waitForTimeout(750);
  await page.getByLabel("E-mail do responsável").fill(email);
  await page.getByRole("button", { name: "Receber código de acesso" }).click();
  await expect(page).toHaveURL(/\/acesso\/codigo/);
  await page.getByLabel("Código de seis dígitos").fill("123456");
  await page.getByRole("button", { name: "Validar e acessar" }).click();
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

test("responsável pago confirma documentação e assento", async ({ page }) => {
  await loginGuardian(page, "familia@example.com");
  await expect(page).toHaveURL(/\/alunos$/);
  await page.getByRole("link", { name: "Escolher assento" }).first().click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Assento 1, disponível" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Confirmar assento" }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Finalizar" }).click();
  await expect(page.getByRole("heading", { name: "Assento confirmado" })).toBeVisible();
});

test("responsável pendente recebe bloqueio explicativo", async ({ page }) => {
  await loginGuardian(page, "pendente@example.com");
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
  await page.getByLabel("Planilha de alunos").setInputFiles({
    name: "alunos.html",
    mimeType: "text/html",
    buffer: Buffer.from(`
      <table>
        <tr><th></th><th>E</th><th>F</th><th>G</th></tr>
        <tr><th>1</th><td>Aluno</td><td>Responsável</td><td>Email Responsável</td></tr>
        <tr><th>2</th><td>Aluno Teste E2E</td><td>Responsável Teste E2E</td><td>e2e@example.com</td></tr>
      </table>
    `),
  });
  await page.getByRole("button", { name: "Importar", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("1 responsáveis e 1 crianças criados");
  const pendingRow = page.getByRole("row").filter({ hasText: "Rafael Santos" });
  await pendingRow.getByRole("button", { name: "Marcar pago" }).click();
  await expect(pendingRow.getByText("Pago", { exact: true })).toBeVisible();
});
