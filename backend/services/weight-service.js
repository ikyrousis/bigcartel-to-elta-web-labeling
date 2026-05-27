// Calculates the total shipment weight for an order.

const WEIGHT_LIMIT_KG = 2.0;

function calculateOrderWeight(order, productDetails, corePackagingWeight) {
  let total = parseFloat(corePackagingWeight);

  for (const item of order.items) {
    const detail = productDetails[item.productName];
    if (detail) {
      total += parseFloat(detail.weight) * parseInt(item.quantity, 10);
    }
  }

  return total;
}

function exceedsWeightLimit(totalWeight) {
  return totalWeight > WEIGHT_LIMIT_KG;
}

module.exports = {
  calculateOrderWeight,
  exceedsWeightLimit,
  WEIGHT_LIMIT_KG
};