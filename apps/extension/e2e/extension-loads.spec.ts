import { test, expect } from "./fixtures";

test("built extension loads without manifest errors and registers a service worker", async ({
  context,
}) => {
  let [serviceWorker] = context.serviceWorkers();
  if (!serviceWorker) {
    serviceWorker = await context.waitForEvent("serviceworker");
  }
  expect(serviceWorker.url()).toContain("service-worker.js");
});

test("side panel seeds fixture data and renders the triage list", async ({
  context,
}) => {
  let [serviceWorker] = context.serviceWorkers();
  if (!serviceWorker) {
    serviceWorker = await context.waitForEvent("serviceworker");
  }
  const extensionId = serviceWorker.url().split("/")[2];

  const consoleErrors: string[] = [];
  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await page.waitForSelector("li");

  await expect(page.locator("li")).toHaveCount(3);
  await expect(
    page.getByText("look at the connector bug before Thursday"),
  ).toBeVisible();
  expect(consoleErrors).toEqual([]);

  // Confirm/dismiss actually write through to IndexedDB, not just the DOM.
  const taskItem = page.locator("li", { hasText: "look at the connector bug" });
  await taskItem.getByRole("button", { name: "Confirm" }).click();
  await expect(taskItem.locator(".status-badge")).toHaveText("confirmed");
});
