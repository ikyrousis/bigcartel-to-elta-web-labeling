//Required dependencies
const readline = require('readline');
const puppeteer = require('puppeteer');
const path = require('path');
require('dotenv').config(); 

const { collectProductDetails, collectCorePackagingWeight, collectUniversalProductDescription } = require('./userinput');
const { readCsvAndProcessOrders } = require('./orderProcessing');

//Create interface for user input/output
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//Prompt user for product details
const askQuestion = (question) => {
    return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
};

//Define the path to the CSV file containing order information
const csvFilePath = path.join(__dirname, 'orders.csv');

async function run() {

    //Wait before proceeding (simulate download delay)
    await new Promise(resolve => setTimeout(resolve, 1000));

    //Collect product details, packaging weight, and product description from the user
    const productDetails = await collectProductDetails(askQuestion);
    const corePackagingWeight = await collectCorePackagingWeight(askQuestion);  
    const universalProductDescription = await collectUniversalProductDescription(askQuestion, rl);  

    //Launch Puppeteer browser in non-headless mode
    await new Promise(resolve => setTimeout(resolve, 5000));
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    //Set download behavior to allow downloading files to the current directory
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: path.resolve(__dirname),
    });

    //Navigate to the web labeling page
    await page.goto('https://weblabeling.elta.gr/en-GB/Account/NCLogin');

    //Wait for the page to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    //Input the e-mail -> update with your e-mail accordingly
    await page.type('input[name="Email"]', process.env.EMAIL_ADDRESS);
    await page.click('input[name="AgreedToTerms"]');

    //Ask the user to solve the CAPTCHA manually
    console.log('Please solve the captcha manually and press "continue" to proceed to the next page...');

    //Process orders after the user has logged in
    await readCsvAndProcessOrders(page, productDetails, corePackagingWeight, universalProductDescription, csvFilePath);

    await browser.close();
}

run().catch(console.error);