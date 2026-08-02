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
