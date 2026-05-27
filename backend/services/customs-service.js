const { nonEuropeanCountries } = require('../models/region');

// Determines whether an order requires a customs declaration
function requiresCustomsDeclaration(countryCode) {
  return nonEuropeanCountries.includes(countryCode);
}

// Groups order items into customs declaration rows.
// Items sharing the same description, HS tariff number and country of origin are merged into a single row with accumulated quantity, weight and value.
function buildCustomsGroups(order, productDetails, productToCategory) {
  const groups = {};

  for (const item of order.items) {
    const { productName, quantity } = item;
    const detail = productDetails[productName];
    const category = productToCategory[productName];

    const groupKey = `${category.description}|${category.hsTarifNumber || ''}|${category.countryOfOrigin || ''}`;

    if (!groups[groupKey]) {
      groups[groupKey] = {
        description: category.description,
        quantity: 0,
        weight: 0,
        value: 0,
        hsTarifNumber: category.hsTarifNumber || null,
        countryOfOrigin: category.countryOfOrigin || null
      };
    }

    groups[groupKey].quantity += quantity;
    groups[groupKey].weight += parseFloat(detail.weight) * quantity;
    groups[groupKey].value += parseFloat(detail.customsValue) * quantity;
  }

  return Object.values(groups);
}

module.exports = {
  requiresCustomsDeclaration,
  buildCustomsGroups
};