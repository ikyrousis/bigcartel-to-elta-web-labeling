const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const puppeteer = require('puppeteer');
const { cleanPhoneNumber, normalizeSpecialCharacters, formatWeightForInput } = require('./formatters');
const { countryCodeToName, stateAbbreviations } = require('./regionMappings');
require('dotenv').config();

//Read orders from CSV and process them
async function readCsvAndProcessOrders(page, productDetails, corePackagingWeight, productToDescription, csvFilePath) {
    const results = [];
    const skippedOrders = [];
  
    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
          const postalCode = String(data['Shipping zip']);
          let totalQuantity = 0;
          let totalOrderValue = 0;
  
          const items = data['Items'].split(';').map(item => {
            const parts = item.split('|');
            const productPart = parts.find(p => p.startsWith('product_name'));
            const productName = productPart ? productPart.split(':')[1] : 'Unknown';
  
            const quantityPart = parts.find(p => p.startsWith('quantity'));
            const quantity = quantityPart ? parseInt(quantityPart.split(':')[1], 10) : 0;
            totalQuantity += quantity;
  
            const itemPrice = parseFloat(productDetails[productName]?.customsValue || '0');
            totalOrderValue += itemPrice * quantity;
  
            return { productName, quantity };
          });
  
          const countriesWithNumberFirst = ['US', 'CA', 'GB', 'AU', 'NZ'];
          let addressNumber, addressRest;
  
          if (countriesWithNumberFirst.includes(data['Shipping country'])) {
            const addressParts = data['Shipping address 1'].split(' ');
            if (/^\d+[A-Za-z]*/.test(addressParts[0])) {
              addressNumber = addressParts.shift();
              addressRest = addressParts.join(' ');
            } else {
              addressNumber = '-';
              addressRest = data['Shipping address 1'];
            }
          } else {
            addressNumber = '-';
            addressRest = data['Shipping address 1'];
          }
  
          const cleanedPhoneNumber = cleanPhoneNumber(data['Buyer phone number']);
  
          results.push({
            firstName: data['Buyer first name'],
            lastName: data['Buyer last name'],
            country: data['Shipping country'],
            addressNumber,
            addressRest,
            streetSpecification: data['Shipping address 2'],
            city: data['Shipping city'],
            state: data['Shipping state'],
            zip: postalCode,
            phone: cleanedPhoneNumber,
            totalQuantity,
            totalOrderValue,
            items
          });
        })
        .on('end', async () => {
          console.log('CSV file processing started.');
  
          for (const order of results) {
            try {
              let totalWeight = parseFloat(corePackagingWeight);
  
              for (const item of order.items) {
                const detail = productDetails[item.productName];
                if (detail) {
                  const weight = parseFloat(detail.weight);
                  const quantity = parseInt(item.quantity, 10);
                  totalWeight += weight * quantity;
                }
              }
  
              if (totalWeight > 2.0) {
                skippedOrders.push({
                  name: `${order.firstName} ${order.lastName}`,
                  reason: `Total weight ${totalWeight.toFixed(2)}kg exceeds 2kg limit`
                });
                continue;
              }
  
              await processOrder(page, order, productDetails, corePackagingWeight, productToDescription);
              console.log(`✅ Processed: ${order.firstName} ${order.lastName}`);
            } catch (error) {
              skippedOrders.push({
                name: `${order.firstName} ${order.lastName}`,
                reason: `Error: ${error.message}`
              });
              console.error(`❌ Failed: ${order.firstName} ${order.lastName}`, error);
            }
          }
  
          if (skippedOrders.length > 0) {
            const logContent = skippedOrders.map(o => `${o.name} — ${o.reason}`).join('\n');
            fs.writeFileSync(path.join(__dirname, '..', 'skipped-orders.log'), logContent);
            console.log(`⚠️ ${skippedOrders.length} order(s) skipped. See skipped-orders.log`);
          }
  
          console.log('✅ CSV file processing completed.');
          resolve();
        })
        .on('error', (error) => {
          console.error('❌ Error reading the CSV file:', error);
          reject(error);
        });
    });
  }

async function processOrder(page, order, productDetails, corePackagingWeight, productToDescription) {
    //Navigate to the 'New Voucher' page
    await page.waitForSelector('#NavNewVoucher', { visible: true });
    await page.click('#NavNewVoucher');

    //Wait for the country dropdown to be clickable and open it
    await page.waitForSelector("[aria-labelledby='select2-CountryCode-container']", { visible: true });
    await page.click("[aria-labelledby='select2-CountryCode-container']").catch(e => console.error("Error clicking the element:", e.message));

    //Use the countryCodeToName mapping to get the full country name
    const countryFullName = countryCodeToName[order.country]; //|| order.country;

    //Wait for the dropdown to open and input field to be available
    await page.waitForSelector('.select2-search--dropdown .select2-search__field');

    //Type the full country name into the input field
    await page.type('.select2-search--dropdown .select2-search__field', countryFullName);

    //Press Enter to select the filtered option
    await page.keyboard.press('Enter');

    //Wait for the process to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    //Wait for the country dropdown to be clickable and open it
    await page.waitForSelector("[aria-labelledby='select2-ServiceCode-container']", { visible: true });
    await page.click("[aria-labelledby='select2-ServiceCode-container']").catch(e => console.error("Error clicking the element:", e.message));

    //Wait for the dropdown to open and input field to be available
    await page.waitForSelector('.select2-search--dropdown .select2-search__field');

    //Type the full country name into the input field
    await page.type('.select2-search--dropdown .select2-search__field', 'LETTER RE');

    //Press Enter to select the filtered option
    await page.keyboard.press('Enter');

    //Wait for the button to be clickable and visible
    await page.waitForSelector('#btnCreateVoucher', { visible: true });

    //Click the button by its id
    await page.click('#btnCreateVoucher');


    //Wait for the process to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Use environment variables for sender details
    await page.$eval('input[name="SenderFirstName"]', (el, value) => el.value = value, process.env.SENDER_FIRST_NAME);
    await page.$eval('input[name="SenderLastName"]', (el, value) => el.value = value, process.env.SENDER_LAST_NAME);
    await page.$eval('input[name="SenderStreetName"]', (el, value) => el.value = value, process.env.SENDER_STREET_NAME);
    await page.$eval('input[name="SenderStreetNumber"]', (el, value) => el.value = value, process.env.SENDER_STREET_NUMBER);
    await page.$eval('input[name="SenderStreetSpecification"]', (el, value) => el.value = value, process.env.SENDER_STREET_SPECIFICATION);
    await page.$eval('input[name="SenderPostalCode"]', (el, value) => el.value = value, process.env.SENDER_POSTAL_CODE);
    await page.$eval('input[name="SenderTown"]', (el, value) => el.value = value, process.env.SENDER_TOWN);

    await page.click('.btn-next[data-step="2"]').catch(e => console.error("Error clicking the 'Next' button:", e.message));

    //Wait for the process to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    await page.type('input[name="RecipientFirstName"]', normalizeSpecialCharacters(order.firstName));
    await page.type('input[name="RecipientLastName"]', normalizeSpecialCharacters(order.lastName));
    await page.type('input[name="RecipientStreetName"]', normalizeSpecialCharacters(order.addressRest));
    await page.type('input[name="RecipientStreetNumber"]', order.addressNumber);
    await page.type('input[name="RecipientStreetSpecification"]', normalizeSpecialCharacters(order.streetSpecification));
    if (order.country == 'US') {
        //Format the postal code to ensure it is 5 digits long
        const formattedPostalCode = order.zip.padStart(5, '0');

        await page.type('input[name="RecipientPostalCode"]', stateAbbreviations[normalizeSpecialCharacters(order.state)] + ' ' + normalizeSpecialCharacters(formattedPostalCode));
        await page.type('input[name="RecipientTown"]', normalizeSpecialCharacters(order.city));
    }
    else {
        await page.type('input[name="RecipientPostalCode"]', normalizeSpecialCharacters(order.zip));
        await page.type('input[name="RecipientTown"]', normalizeSpecialCharacters(order.city) + ' ' + normalizeSpecialCharacters(order.state));
    }
    await page.type('input[name="RecipientTelephone"]', order.phone);

    //Calculate the total weight of all items
    //Start with the core packaging weight
    let totalWeight = parseFloat(corePackagingWeight);

    for (const item of order.items) {
        const itemDetail = productDetails[item.productName];
        if (itemDetail && itemDetail.weight) {
            const itemWeight = parseFloat(itemDetail.weight);
            const quantity = parseInt(item.quantity, 10);
            //Add product weight multiplied by its quantity
            totalWeight += itemWeight * quantity;
        }
    }

    console.log(`Total weight: ${totalWeight}`);

    await page.type('input[name="VoucherDetailWeight"]', formatWeightForInput(totalWeight));

    await page.evaluate(() => {
        const checkbox = document.querySelector('#VoucherDetailGift');
        //Force checkbox to checked state
        checkbox.checked = true;
        //Trigger change event if needed
        checkbox.dispatchEvent(new Event('change'));
    });

    await page.click('button[data-step="3"]').catch(e => console.error("Error clicking the 'Next' button:", e.message));

    //Wait for the process to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    //Define the country codes that require to fill in a customs form
    const nonEuropeanCountries = ['CA', 'US', 'GB', 'AU', 'JP', 'KR', 'NO', 'CH', 'NZ', 'TW'];

    if (nonEuropeanCountries.includes(order.country)) {
        const customsGroups = {};

        for (const item of order.items) {
            const productName = item.productName;
            const quantity = item.quantity;
            const productDetail = productDetails[productName];
            const description = productToDescription[productName];

            if (!customsGroups[description]) {
                customsGroups[description] = { quantity: 0, weight: 0, value: 0 };
            }

            const weight = parseFloat(productDetail.weight);
            const value = parseFloat(productDetail.customsValue);

            customsGroups[description].quantity += quantity;
            customsGroups[description].weight += weight * quantity;
            customsGroups[description].value += value * quantity;
        }

        let rowIndex = 1;
        for (const [description, data] of Object.entries(customsGroups)) {
            await page.type(`input[name="CustomsDeclarationDetailedDescriptionOfContents${rowIndex}"]`, description);
            await page.type(`input[name="CustomsDeclarationQuantity${rowIndex}"]`, data.quantity.toString());
            await page.type(`input[name="CustomsDeclarationNetWeight${rowIndex}"]`, formatWeightForInput(data.weight));
            await page.type(`input[name="CustomsDeclarationValue${rowIndex}"]`, data.value.toFixed(2).replace('.', ','));
            rowIndex++;
        }

        await page.click('button[data-step="4"]').catch(e => console.error("Error clicking the 'Next' button:", e.message));

        //Wait for the process to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    //Wait for the button to be clickable and visible
    await page.waitForSelector('#printVoucher', { visible: true });

    //Click the button by its id
    await page.click('#printVoucher').catch(e => console.error("Error clicking the 'Print' button:", e.message));

    //Wait for the download to complete
    await new Promise(resolve => setTimeout(resolve, 5000));
}

async function runPuppeteerWithData({ csvPath, productDetails, corePackagingWeight, productToDescription }) {
    const browser = await puppeteer.launch({
        headless: false,
        protocolTimeout: 0 // disable timeout completely
      });      
    const page = await browser.newPage();

    try {
        const client = await page.target().createCDPSession();
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: path.resolve(__dirname, '..'),
        });

        await page.goto('https://weblabeling.elta.gr/en-GB/Account/NCLogin', { waitUntil: 'domcontentloaded' });
        console.log('✅ Page loaded');

        await page.waitForSelector('input[name="Email"]', { timeout: 15000 });
        await page.type('input[name="Email"]', process.env.EMAIL_ADDRESS);
        await page.click('input[name="AgreedToTerms"]');
        console.log('✅ Form filled. Solve CAPTCHA...');

        // Wait for CAPTCHA to be solved
        await page.waitForSelector('#NavNewVoucher', { timeout: 0 }); // waits indefinitely

        console.log("productToDescription:", productToDescription);

        await readCsvAndProcessOrders(page, productDetails, corePackagingWeight, productToDescription, csvPath);
    } catch (err) {
        console.error('❌ Puppeteer failed:', err);
        await page.screenshot({ path: 'puppeteer-error.png' });
    }

    await browser.close();
}

module.exports = {
    readCsvAndProcessOrders,
    processOrder,
    runPuppeteerWithData
};