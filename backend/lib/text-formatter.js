const unidecode = require('unidecode');

//Clean and format phone numbers
function cleanPhoneNumber(rawPhoneNumber) {
    //First, remove the country code if it exists (assuming it starts with + followed by digits)
    let cleanedNumber = rawPhoneNumber.replace(/^\+\d+\s*/, '');

    //Then, remove all spaces, dashes, parentheses
    cleanedNumber = cleanedNumber.replace(/[\s()-]/g, '');

    return cleanedNumber;
}

//Format the weight in the required format (French decimal)
function formatWeightForInput(totalWeight) {
    return totalWeight.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

//Normalize and clean text input
function normalizeSpecialCharacters(inputText) {
    //First convert the text to ASCII equivalents, then replace all apostrophes with spaces
    return unidecode(inputText).replace(/'/g, ' ');
}


module.exports = {
    cleanPhoneNumber,
    formatWeightForInput,
    normalizeSpecialCharacters
  };