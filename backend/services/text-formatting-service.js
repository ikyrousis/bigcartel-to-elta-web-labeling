const unidecode = require('unidecode');

// Clean and format phone numbers
function cleanPhoneNumber(rawPhoneNumber) {
  let cleaned = rawPhoneNumber.replace(/^\+\d+\s*/, '');
  cleaned = cleaned.replace(/[\s()-]/g, '');
  return cleaned;
}

// Format weight as French decimal string (e.g. 1,25)
function formatWeightForInput(totalWeight) {
  return totalWeight.toLocaleString('fr-FR', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  });
}

// Transliterate unicode to ASCII and sanitize apostrophes
function normalizeSpecialCharacters(inputText) {
  return unidecode(inputText).replace(/'/g, ' ');
}

module.exports = {
  cleanPhoneNumber,
  formatWeightForInput,
  normalizeSpecialCharacters
};