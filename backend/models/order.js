// Defines the Order data contract.

/**
 * @typedef {Object} OrderItem
 * @property {string} productName
 * @property {number} quantity
 */

/**
 * @typedef {Object} Order
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} country       - ISO 2-letter country code
 * @property {string} addressNumber - Street number, or '-' if not applicable
 * @property {string} addressRest   - Street name
 * @property {string} streetSpecification - Address line 2
 * @property {string} city
 * @property {string} state
 * @property {string} zip
 * @property {string} phone
 * @property {number} totalQuantity
 * @property {number} totalOrderValue
 * @property {OrderItem[]} items
 */

module.exports = {};