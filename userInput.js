const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const csvFilePath = path.join(__dirname, 'orders.csv');

//Collect product details from the user
async function collectProductDetails(askQuestion) {
    const uniqueProducts = new Set();
    const productDetails = {};

    //Read the CSV to find unique products
    await new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', data => {
                const items = data['Items'].split(';');
                items.forEach(item => {
                    const match = item.match(/product_name:([^|]+)/);
                    if (match && match[1]) {
                        uniqueProducts.add(match[1].trim());
                    }
                });
            })
            .on('end', resolve)
            .on('error', reject);
    });

    //Prompt user for details of each unique product
    for (const productName of uniqueProducts) {
        console.log(`Enter details for ${productName}:`);
        const weight = await askQuestion('Weight: ');
        const customsValue = await askQuestion('Customs value: ');
        productDetails[productName] = { weight, customsValue };
    }

    return productDetails;
}

//Collect packaging weight from the user
async function collectCorePackagingWeight(askQuestion) {
    const corePackagingWeight = await askQuestion('Enter the weight of the core packaging (kg): ');
    return corePackagingWeight;  
}

//Collect a universal product description from the user
async function collectUniversalProductDescription(askQuestion, rl) {
    const description = await askQuestion('Enter the universal description for all products: ');
    //Ensure to close readline only once, after all prompts are done
    rl.close();  
    return description;
}


module.exports = {
    collectProductDetails,
    collectCorePackagingWeight,
    collectUniversalProductDescription
  };