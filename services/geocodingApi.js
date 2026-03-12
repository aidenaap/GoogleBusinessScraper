/**
 * Geocoding API Service
 * 
 * This service handles converting postal codes into geographic coordinates (latitude/longitude).
 * We need coordinates to search for businesses in a specific area using Google Places API.
 * 
 * Google Geocoding API docs: https://developers.google.com/maps/documentation/geocoding
 */

const axios = require('axios');
const config = require('../config/config');


/**
 * Convert one postal code to geographic coordinates
 * 
 * @param {string} postalCode - The postal code to geocode (e.g., "90210", "10001")
 * @returns {Promise<Object>} Object containing { lat, lng, formattedAddress }
 * @throws {Error} If geocoding fails or no results found
 * 
 */
async function geocodePostalCode(postalCode) {
  try {
    // Construct the API URL
    const url = `${config.google.baseUrls.geocoding}/json`;
    
    // Make the request to Google Geocoding API
    const response = await axios.get(url, {
      params: {
        address: postalCode,
        key: config.google.placesApiKey
      }
    });

    // Check if we got results
    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address
      };
    }
    
    // Handle different API error statuses
    if (response.data.status === 'ZERO_RESULTS') {
      throw new Error(`No location found for postal code: ${postalCode}`);
    }
    
    if (response.data.status === 'REQUEST_DENIED') {
      throw new Error('Geocoding API request denied. Check your API key and enabled APIs.');
    }
    
    if (response.data.status === 'INVALID_REQUEST') {
      throw new Error(`Invalid postal code format: ${postalCode}`);
    }
    
    // Generic error for other status codes
    throw new Error(`Geocoding failed with status: ${response.data.status}`);
    
  } catch (error) {
    // If it's already an error we threw, re-throw it
    if (error.message.includes('postal code') || error.message.includes('Geocoding')) {
      throw error;
    }
    
    // Handle network or other errors
    console.error(`Error geocoding postal code ${postalCode}:`, error.message);
    throw new Error(`Failed to geocode postal code ${postalCode}: ${error.message}`);
  }
}

/**
 * Batch geocode multiple postal codes
 * 
 * @param {Array<string>} postalCodes - Array of postal codes to geocode
 * @param {Function} progressCallback - Optional callback to report progress
 * @returns {Promise<Array>} Array of { postalCode, lat, lng, formattedAddress } or { postalCode, error }
 * 
 */
async function batchGeocodePostalCodes(postalCodes, progressCallback = null) {
  const results = [];
  let completed = 0;
  const total = postalCodes.length;

  for (const postalCode of postalCodes) {
    try {
      const location = await geocodePostalCode(postalCode);
      results.push({
        postalCode,
        ...location,
        success: true
      });
    } catch (error) {
      results.push({
        postalCode,
        error: error.message,
        success: false
      });
    }

    completed++;
    
    // Call progress callback if provided
    if (progressCallback) {
      progressCallback({
        completed,
        total,
        postalCode,
        percentage: Math.round((completed / total) * 100)
      });
    }

    // Rate limiting - add delay between requests
    if (completed < total) {
      await sleep(config.rateLimit.delayBetweenRequests);
    }
  }

  return results;
}

/**
 * Helper function to pause execution
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate a postal code format (basic validation)
 * 
 * @param {string} postalCode - Postal code to validate
 * @returns {Object} { valid: boolean, error: string|null }
 */
function validatePostalCode(postalCode) {
    if (!postalCode || typeof postalCode !== 'string') {
        return {
        valid: false,
        error: 'Postal code must be a non-empty string'
        };
    }

    const trimmed = postalCode.trim();
    
    if (trimmed.length === 0) {
        return {
        valid: false,
        error: 'Postal code cannot be empty'
        };
    }

    // Basic length check (most postal codes are 3-10 characters)
    if (trimmed.length < 3 || trimmed.length > 10) {
        return {
        valid: false,
        error: 'Postal code must be between 3 and 10 characters'
        };
    }

    return {
        valid: true,
        error: null
    };
}

// Export all functions
module.exports = {
  geocodePostalCode,
  batchGeocodePostalCodes,
  validatePostalCode,
  sleep  // Export sleep so other services can use it
};