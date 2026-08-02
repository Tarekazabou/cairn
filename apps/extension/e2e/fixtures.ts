import { test as base, chromium, type BrowserContext } from "@playwright/test";
import { fileURLToPath } from "node:url";

const extensionPath = fileURLToPath(new URL("../dist", import.meta.url));

export const test = base.extend<{ context: BrowserContext }>({
  // eslint-disable-next-line no-empty-pattern -- Playwright's documented fixture pattern: {} means "no other fixtures needed"
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext("", {
      channel: "chromium",
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        "--headless=new",
      ],
    });
    await use(context);
    await context.close();
  },
});

export const expect = test.expect;
