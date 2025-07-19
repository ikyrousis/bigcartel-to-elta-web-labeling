const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { cleanPhoneNumber } = require('../lib/text-formatter');
const { processOrder, checkForCommunicationModal } = require('./elta-dom-service');

//Process a single order with enhanced retry functionality and graceful Puppeteer handling
async function processOrderWithRetry(page, order, productDetails, corePackagingWeight, productToDescription, skippedOrders) {
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
    return;
  }

  let attempts = 0;
  const maxAttempts = 3;
  let lastError = null;
  let browserClosed = false;

  while (attempts < maxAttempts && !browserClosed) {
    attempts++;
    try {
      console.log(`🔄 Processing: ${order.firstName} ${order.lastName} (Attempt ${attempts}/${maxAttempts})`);

      // Check if page is still valid before processing
      if (!page || page.isClosed()) {
        browserClosed = true;
        throw new Error('Browser closed during processing');
      }

      // Attempt to process the order
      await processOrder(page, order, productDetails, corePackagingWeight, productToDescription);

      // Check if a communication modal appeared (indicating failure)
      const modalAppeared = await checkForCommunicationModal(page);
      if (modalAppeared) {
        throw new Error('Communication error modal appeared - voucher generation failed');
      }

      console.log(`✅ Processed: ${order.firstName} ${order.lastName}`);
      lastError = null;
      break;

    } catch (error) {
      lastError = error;

      // Check if this is a browser closure error
      if (error.message.includes('browser was closed') ||
        error.message.includes('target closed') ||
        error.message.includes('Execution context was destroyed')) {
        browserClosed = true;
        console.error(`🛑 Browser closed during processing: ${order.firstName} ${order.lastName}`);
        skippedOrders.push({
          name: `${order.firstName} ${order.lastName}`,
          reason: `Browser closed during processing`
        });
        break; // Exit retry loop immediately
      }

      console.error(`❌ Attempt ${attempts} failed: ${order.firstName} ${order.lastName}`, error.message);

      // Check for any modals after error and handle them
      if (page && !page.isClosed()) {
        await checkForCommunicationModal(page);
      }

      if (attempts < maxAttempts && page && !page.isClosed()) {
        console.log(`⏳ Waiting 15 seconds before retry ${attempts + 1}/${maxAttempts}...`);
        await new Promise(resolve => setTimeout(resolve, 15000));
      } else if (!page || page.isClosed()) {
        browserClosed = true;
        skippedOrders.push({
          name: `${order.firstName} ${order.lastName}`,
          reason: `Browser closed during processing`
        });
        break;
      }
    }
  }

  // Only add retry exhaustion message if browser didn't close
  if (lastError && !browserClosed) {
    skippedOrders.push({
      name: `${order.firstName} ${order.lastName}`,
      reason: `Error after ${maxAttempts} attempts: ${lastError.message}`
    });
    console.error(`❌ Failed permanently: ${order.firstName} ${order.lastName} after ${maxAttempts} attempts`);
  }
}

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
          await processOrderWithRetry(page, order, productDetails, corePackagingWeight, productToDescription, skippedOrders);
        }

        if (skippedOrders.length > 0) {
          const logContent = skippedOrders.map(o => `${o.name} — ${o.reason}`).join('\n');

          //Define the appropriate log directory
          let logDir;
          if (process.env.NODE_ENV === 'development') {
            logDir = path.resolve(__dirname, '..', '..');
          } else {
            //In production, use user's Downloads folder
            const { app } = require('electron');
            logDir = path.join(app.getPath('downloads'), 'Elta Shipping Labels');
          }

          //Ensure the directory exists
          if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
          }

          const logPath = path.join(logDir, 'skipped-orders.log');
          fs.writeFileSync(logPath, logContent);
          console.log(`⚠️ ${skippedOrders.length} order(s) skipped. See ${logPath}`);
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

module.exports = {
  readCsvAndProcessOrders
};
