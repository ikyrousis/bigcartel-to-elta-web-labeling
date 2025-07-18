const { readCsvAndProcessOrders } = require('./services/big-cartel-order-service');
const { processOrder, runPuppeteerWithData } = require('./services/elta-dom-service');

module.exports = {
    readCsvAndProcessOrders,
    processOrder,
    runPuppeteerWithData
};
