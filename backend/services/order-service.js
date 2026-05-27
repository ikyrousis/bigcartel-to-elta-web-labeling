const { calculateOrderWeight, exceedsWeightLimit } = require('./weight-service');

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 15000;

const BROWSER_CLOSED_SIGNALS = [
  'browser was closed',
  'target closed',
  'Execution context was destroyed'
];

function isBrowserClosedError(error) {
  return BROWSER_CLOSED_SIGNALS.some(signal => error.message.includes(signal));
}

// Processes a single order with retry logic.
async function processOrderWithRetry(order, productDetails, corePackagingWeight, productToCategory, executeOrder, skippedOrders) {
  const totalWeight = calculateOrderWeight(order, productDetails, corePackagingWeight);
  const orderName = `${order.firstName} ${order.lastName}`;

  if (exceedsWeightLimit(totalWeight)) {
    skippedOrders.push({
      name: orderName,
      reason: `Total weight ${totalWeight.toFixed(2)}kg exceeds ${WEIGHT_LIMIT_KG}kg limit`
    });
    return;
  }

  let attempts = 0;
  let lastError = null;
  let browserClosed = false;

  while (attempts < MAX_ATTEMPTS && !browserClosed) {
    attempts++;
    try {
      console.log(`🔄 Processing: ${orderName} (Attempt ${attempts}/${MAX_ATTEMPTS})`);
      await executeOrder(order);
      console.log(`✅ Processed: ${orderName}`);
      lastError = null;
      break;
    } catch (error) {
      lastError = error;

      if (isBrowserClosedError(error)) {
        browserClosed = true;
        console.error(`🛑 Browser closed during processing: ${orderName}`);
        skippedOrders.push({ name: orderName, reason: 'Browser closed during processing' });
        break;
      }

      console.error(`❌ Attempt ${attempts} failed: ${orderName}`, error.message);

      if (attempts < MAX_ATTEMPTS) {
        console.log(`⏳ Waiting ${RETRY_DELAY_MS / 1000}s before retry ${attempts + 1}/${MAX_ATTEMPTS}...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  if (lastError && !browserClosed) {
    skippedOrders.push({
      name: orderName,
      reason: `Error after ${MAX_ATTEMPTS} attempts: ${lastError.message}`
    });
    console.error(`❌ Failed permanently: ${orderName} after ${MAX_ATTEMPTS} attempts`);
  }
}

module.exports = {
  processOrderWithRetry
};