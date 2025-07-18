const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { cleanPhoneNumber } = require('../formatters');
const { processOrder } = require('./webAutomation');

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
            
            // Get the appropriate log directory (consistent with label downloads)
            let logDir;
            if (process.env.NODE_ENV === 'development') {
                logDir = path.resolve(__dirname, '..', '..');
            } else {
                // In production, use user's Downloads folder (same as labels)
                const { app } = require('electron');
                logDir = path.join(app.getPath('downloads'), 'Elta Shipping Labels');
            }

            // Ensure the directory exists
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
