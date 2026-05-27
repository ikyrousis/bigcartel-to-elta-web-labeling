const fs = require('fs');
const csv = require('csv-parser');
const { cleanPhoneNumber } = require('../services/text-formatting-service');
const { countriesWithNumberFirst } = require('../models/region');

// Parses a raw CSV row into a structured Order shape
function parseOrderRow(data, productDetails) {
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
    totalOrderValue += parseFloat(productDetails[productName]?.customsValue || '0') * quantity;

    return { productName, quantity };
  });

  let addressNumber, addressRest;
  if (countriesWithNumberFirst.includes(data['Shipping country'])) {
    const parts = data['Shipping address 1'].split(' ');
    if (/^\d+[A-Za-z]*/.test(parts[0])) {
      addressNumber = parts.shift();
      addressRest = parts.join(' ');
    } else {
      addressNumber = '-';
      addressRest = data['Shipping address 1'];
    }
  } else {
    addressNumber = '-';
    addressRest = data['Shipping address 1'];
  }

  return {
    firstName: data['Buyer first name'],
    lastName: data['Buyer last name'],
    orderNumber: data['Number'],
    country: data['Shipping country'],
    addressNumber,
    addressRest,
    streetSpecification: data['Shipping address 2'],
    city: data['Shipping city'],
    state: data['Shipping state'],
    zip: postalCode,
    phone: cleanPhoneNumber(data['Buyer phone number']),
    totalQuantity,
    totalOrderValue,
    items
  };
}

// Reads a CSV file and returns a Promise resolving to an array of Orders
function readOrders(csvFilePath, productDetails) {
  return new Promise((resolve, reject) => {
    const orders = [];

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => {
        orders.push(parseOrderRow(data, productDetails));
      })
      .on('end', () => resolve(orders))
      .on('error', reject);
  });
}

module.exports = { readOrders };