const { readCsvAndProcessOrders } = require('./services/csvProcessor');
const { processOrder, runPuppeteerWithData } = require('./services/webAutomation');

module.exports = {
    readCsvAndProcessOrders,
    processOrder,
    runPuppeteerWithData
};
