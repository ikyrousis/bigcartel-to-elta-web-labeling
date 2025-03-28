const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const csvFilePath = path.join(__dirname, 'orders.csv');

// Collect product details from the user
async function collectProductDetails(askQuestion) {
    const uniqueProducts = new Set();
    const productDetails = {};

    // Read the CSV to find unique products
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

    // Prompt user for details of each unique product
    for (const productName of uniqueProducts) {
        console.log(`Enter details for ${productName}:`);
        const weight = await askQuestion('Weight (kg): ');
        const customsValue = await askQuestion('Customs value (EUR): ');
        productDetails[productName] = { weight, customsValue };
    }

    return productDetails;
}

// Collect packaging weight from the user
async function collectCorePackagingWeight(askQuestion) {
    const corePackagingWeight = await askQuestion('Enter the weight of the core packaging (kg): ');
    return corePackagingWeight;
}

// Collect customs descriptions and map products to them
async function collectCustomsDescriptionsAndMapProducts(askQuestion, productDetails) {
    const customsDescriptions = [];
    const productToDescription = {};
    const productNames = Object.keys(productDetails);

    // Step 1: Define customs description categories
    const numDescriptions = parseInt(await askQuestion('How many customs description categories do you want to define? '), 10);

    for (let i = 0; i < numDescriptions; i++) {
        const desc = await askQuestion(`Enter customs description #${i + 1} (e.g. "Shirt", "Sweatshirt"): `);
        customsDescriptions.push(desc);
    }

    console.log('\nNow assign each product to one of the customs descriptions:');
    for (const productName of productNames) {
        let chosenDescription;
        while (true) {
            chosenDescription = await askQuestion(`Choose customs description for "${productName}" (options: ${customsDescriptions.join(', ')}): `);
            if (customsDescriptions.includes(chosenDescription)) break;
            console.log('Invalid choice. Please pick one from the listed options.');
        }
        productToDescription[productName] = chosenDescription;
    }

    return productToDescription;
}

module.exports = {
    collectProductDetails,
    collectCorePackagingWeight,
    collectCustomsDescriptionsAndMapProducts
};
