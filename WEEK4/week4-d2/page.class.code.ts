import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext, Page } from '@playwright/test';

let browser: Browser;
let context: BrowserContext;
let page: Page;

Before(async () => {
  browser = await chromium.launch({ headless: false }); // set true in CI
  context = await browser.newContext();
  page = await context.newPage();
});

After(async () => {
  await context.close();
  await browser.close();
});

Given('I open the API key creation page', async () => {
  await page.goto('https://api.testleaf.com/apikey');
});

When('I click the {string} button', async (buttonText: string) => {
  await page.click(`button:has-text("${buttonText}")`);
});

Then('I should see a modal with the title {string}', async (modalTitle: string) => {
  const modalHeader = page.locator('.ant-modal-title');
  await modalHeader.waitFor({ state: 'visible' });

  const titleText = await modalHeader.textContent();
  if (titleText?.trim() !== modalTitle) {
    throw new Error(`Expected modal title to be "${modalTitle}", but got "${titleText}"`);
  }
});

Then('I should see the secret key {string}', async (secretKey: string) => {
  const secretKeyLocator = page.locator('input.ant-input[readonly]');
  await secretKeyLocator.waitFor({ state: 'visible' });

  const keyValue = await secretKeyLocator.inputValue();
  if (keyValue !== secretKey) {
    throw new Error(`Expected secret key to be "${secretKey}", but got "${keyValue}"`);
  }
});

Then('I should see a warning message about the key visibility', async () => {
  const warningMessage = page.locator(
    'small:has-text("* This key will only be shown once. Please copy and store it securely.")'
  );

  await warningMessage.waitFor({ state: 'visible' });
});