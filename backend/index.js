const path = require('path');
const fs = require('fs');
const { app } = require('electron');

const { readOrders } = require('./adapters/big-cartel-adapter');
const { launchBrowser, loginAndWaitForCaptcha, processOrder, checkForCommunicationModal } = require('./adapters/elta-adapter');
const { processOrderWithRetry } = require('./services/order-service');

// Resolves the appropriate output directory for downloads and logs
function resolveOutputDir() {
  if (process.env.NODE_ENV === 'development') {
    return path.resolve(__dirname, '..');
  }
  return path.join(app.getPath('downloads'), 'Elta Shipping Labels');
}

// Writes skipped orders to a log file in the output directory
function writeSkippedOrdersLog(skippedOrders, outputDir) {
  if (skippedOrders.length === 0) return;

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const logContent = skippedOrders.map(o => `${o.name} — ${o.reason}`).join('\n');
  const logPath = path.join(outputDir, 'skipped-orders.log');
  fs.writeFileSync(logPath, logContent);
  console.log(`⚠️ ${skippedOrders.length} order(s) skipped. See ${logPath}`);
}

// Top-level orchestrator — wires all layers together
async function runPuppeteerWithData({ csvPath, productDetails, corePackagingWeight, productToCategory }) {
  const outputDir = resolveOutputDir();

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const { browser, page } = await launchBrowser(outputDir);

  try {
    await loginAndWaitForCaptcha(page);
    console.log('✅ Page loaded');

    const orders = await readOrders(csvPath, productDetails);
    console.log('CSV file processing started.');

    const skippedOrders = [];

    for (const order of orders) {
      // Inject the adapter's processOrder as the executor
      const executeOrder = (order) => processOrder(
        page,
        order,
        productDetails,
        corePackagingWeight,
        productToCategory
      );

      // Inject the modal check so order-service can signal failures
      const executeOrderWithModalCheck = async (order) => {
        await executeOrder(order);
        const modalAppeared = await checkForCommunicationModal(page);
        if (modalAppeared) {
          throw new Error('Communication error modal appeared - voucher generation failed');
        }
      };

      await processOrderWithRetry(
        order,
        productDetails,
        corePackagingWeight,
        productToCategory,
        executeOrderWithModalCheck,
        skippedOrders
      );
    }

    writeSkippedOrdersLog(skippedOrders, outputDir);
    console.log('✅ CSV file processing completed.');

  } catch (err) {
    console.error('❌ Puppeteer failed:', err);
  }

  await browser.close();
}

module.exports = { runPuppeteerWithData };