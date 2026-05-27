const puppeteer = require('puppeteer');
const { normalizeSpecialCharacters, formatWeightForInput } = require('../services/text-formatting-service');
const { requiresCustomsDeclaration, buildCustomsGroups } = require('../services/customs-service');
const { countryCodeToName, stateAbbreviations } = require('../models/region');
const { calculateOrderWeight } = require('../services/weight-service');

// Launches a Puppeteer browser and returns { browser, page }
async function launchBrowser(downloadDir) {
  const browser = await puppeteer.launch({
    headless: false,
    protocolTimeout: 0
  });
  const page = await browser.newPage();

  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadDir
  });

  return { browser, page };
}

// Navigates to the login page and waits for CAPTCHA to be solved
async function loginAndWaitForCaptcha(page) {
  await page.goto('https://weblabeling.elta.gr/en-GB/Account/NCLogin', {
    waitUntil: 'domcontentloaded'
  });
  await page.waitForSelector('input[name="Email"]', { timeout: 15000 });
  await page.type('input[name="Email"]', process.env.EMAIL_ADDRESS);
  await page.click('input[name="AgreedToTerms"]');
  await page.waitForSelector('#NavNewVoucher', { timeout: 0 });
}

// Fills sender details from environment variables
async function fillSenderDetails(page) {
  await page.$eval('input[name="SenderFirstName"]', (el, v) => el.value = v, process.env.SENDER_FIRST_NAME);
  await page.$eval('input[name="SenderLastName"]', (el, v) => el.value = v, process.env.SENDER_LAST_NAME);
  await page.$eval('input[name="SenderStreetName"]', (el, v) => el.value = v, process.env.SENDER_STREET_NAME);
  await page.$eval('input[name="SenderStreetNumber"]', (el, v) => el.value = v, process.env.SENDER_STREET_NUMBER);
  await page.$eval('input[name="SenderStreetSpecification"]', (el, v) => el.value = v, process.env.SENDER_STREET_SPECIFICATION);
  await page.$eval('input[name="SenderPostalCode"]', (el, v) => el.value = v, process.env.SENDER_POSTAL_CODE);
  await page.$eval('input[name="SenderTown"]', (el, v) => el.value = v, process.env.SENDER_TOWN);
}

// Fills recipient details for a given order
async function fillRecipientDetails(page, order) {
  await page.type('input[name="RecipientFirstName"]', normalizeSpecialCharacters(order.firstName));
  await page.type('input[name="RecipientLastName"]', normalizeSpecialCharacters(order.lastName));
  await page.type('input[name="RecipientStreetName"]', normalizeSpecialCharacters(order.addressRest));
  await page.type('input[name="RecipientStreetNumber"]', order.addressNumber);
  await page.type('input[name="RecipientStreetSpecification"]', normalizeSpecialCharacters(order.streetSpecification));

  if (order.country === 'US') {
    const formattedZip = order.zip.padStart(5, '0');
    const stateAbbr = stateAbbreviations[normalizeSpecialCharacters(order.state)];
    await page.type('input[name="RecipientPostalCode"]', `${stateAbbr} ${formattedZip}`);
    await page.type('input[name="RecipientTown"]', normalizeSpecialCharacters(order.city));
  } else {
    await page.type('input[name="RecipientPostalCode"]', normalizeSpecialCharacters(order.zip));
    await page.type('input[name="RecipientTown"]', `${normalizeSpecialCharacters(order.city)} ${normalizeSpecialCharacters(order.state)}`);
  }

  await page.type('input[name="RecipientTelephone"]', order.phone);
}

// Selects country and service type, then initiates voucher creation
async function initiateVoucher(page, countryCode) {
  await page.waitForSelector('#NavNewVoucher', { visible: true });
  await page.click('#NavNewVoucher');

  await page.waitForSelector("[aria-labelledby='select2-CountryCode-container']", { visible: true });
  await page.click("[aria-labelledby='select2-CountryCode-container']");

  await page.waitForSelector('.select2-search--dropdown .select2-search__field');
  await page.type('.select2-search--dropdown .select2-search__field', countryCodeToName[countryCode]);
  await page.keyboard.press('Enter');
  await new Promise(resolve => setTimeout(resolve, 2000));

  await page.waitForSelector("[aria-labelledby='select2-ServiceCode-container']", { visible: true });
  await page.click("[aria-labelledby='select2-ServiceCode-container']");

  await page.waitForSelector('.select2-search--dropdown .select2-search__field');
  await page.type('.select2-search--dropdown .select2-search__field', 'LETTER LL');
  await page.keyboard.press('Enter');

  await page.waitForSelector('#btnCreateVoucher', { visible: true });
  await page.click('#btnCreateVoucher');
  await new Promise(resolve => setTimeout(resolve, 2000));
}

// Checks a form checkbox by ID and fires a change event
async function checkFormOption(page, id) {
  await page.evaluate((id) => {
    const el = document.querySelector(id);
    el.checked = true;
    el.dispatchEvent(new Event('change'));
  }, id);
}

// Fills weight and contents type for the shipment
async function fillShipmentDetails(page, order, productDetails, corePackagingWeight, markAsGift) {
  const totalWeight = calculateOrderWeight(order, productDetails, corePackagingWeight);
  await page.type('input[name="VoucherDetailWeight"]', formatWeightForInput(totalWeight));
  await checkFormOption(page, markAsGift ? '#VoucherDetailGift' : '#VoucherDetailSaleOfGoods');
}

// Fills the customs declaration form rows and invoice number if applicable
async function fillCustomsForm(page, order, productDetails, productToCategory, markAsGift) {
  const groups = buildCustomsGroups(order, productDetails, productToCategory);

  for (let i = 0; i < groups.length; i++) {
    const row = i + 1;
    const data = groups[i];

    await page.type(`input[name="CustomsDeclarationDetailedDescriptionOfContents${row}"]`, data.description);
    await page.type(`input[name="CustomsDeclarationQuantity${row}"]`, data.quantity.toString());
    await page.type(`input[name="CustomsDeclarationNetWeight${row}"]`, formatWeightForInput(data.weight));
    await page.type(`input[name="CustomsDeclarationValue${row}"]`, data.value.toFixed(2).replace('.', ','));

    if (data.countryOfOrigin) {
      await page.type(`input[name="CustomsDeclarationCounryOfOrigionOfGoods${row}"]`, data.countryOfOrigin);
    }
    if (data.hsTarifNumber) {
      await page.type(`input[name="CustomsDeclarationHSTarifNumber${row}"]`, data.hsTarifNumber);
    }
  }

  await page.click('body').catch(() => {});
  await page.waitForSelector('.toast.toast-warning', { visible: true, timeout: 3000 }).catch(() => {});
  await page.waitForSelector('.toast.toast-warning', { hidden: true, timeout: 4000 }).catch(() => {});
  await new Promise(resolve => setTimeout(resolve, 300));

  if (!markAsGift) {
    await checkFormOption(page, '#VoucherDetailInvoiceNumbersFlag');
    await page.type('input[name="VoucherDetailInvoiceNumbers"]', order.orderNumber);
  }
}

// Processes one complete order through the voucher wizard
async function processOrder(page, order, productDetails, corePackagingWeight, productToCategory, markAsGift) {
  await initiateVoucher(page, order.country);
  await fillSenderDetails(page);
  await page.click('.btn-next[data-step="2"]');
  await new Promise(resolve => setTimeout(resolve, 1000));
  await fillRecipientDetails(page, order);
  await fillShipmentDetails(page, order, productDetails, corePackagingWeight, markAsGift);
  await page.click('button[data-step="3"]');
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (requiresCustomsDeclaration(order.country)) {
    await fillCustomsForm(page, order, productDetails, productToCategory, markAsGift);
    await page.click('button[data-step="4"]');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await page.waitForSelector('#printVoucher', { visible: true });
  await page.click('#printVoucher');
  await new Promise(resolve => setTimeout(resolve, 5000));
}

// Checks for a communication error modal and dismisses it
async function dismissErrorModal(page) {
  try {
    const okButton = await page.waitForSelector(
      'button[data-bb-handler="ok"].btn.btn-primary',
      { timeout: 2000, visible: true }
    );
    console.error('Communication error modal detected');
    await okButton.click();
    await new Promise(resolve => setTimeout(resolve, 3000));
  } catch {
  }
}

module.exports = {
  launchBrowser,
  loginAndWaitForCaptcha,
  processOrder,
  dismissErrorModal
};