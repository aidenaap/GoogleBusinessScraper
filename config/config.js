require('dotenv').config();

/**
 * Configuration Module
 * 
 * This module centralizes all configuration management for the application.
 * It reads from environment variables and provides default fallbacks.
 * 
 * 1. Single source of truth for all settings
 * 2. Type conversion happens in one place (strings to numbers, etc.)
 * 3. Easy to validate configuration on startup
 * 4. Makes testing easier - can mock this entire module
 */

const config = {
    // SERVER CONFIGURATION
    server: {
        port: parseInt(process.env.PORT) || 3000,
        env: process.env.NODE_ENV || 'development',
        
        // Returns true if we're in development mode
        isDevelopment: function() {
        return this.env === 'development';
        },
        
        // Returns true if we're in production mode
        isProduction: function() {
        return this.env === 'production';
        }
    },

    // GOOGLE PLACES API CONFIGURATION
    google: {
        placesApiKey: process.env.GOOGLE_PLACES_API_KEY,
        
        // Base URLs for different Google APIs
        baseUrls: {
        places: 'https://maps.googleapis.com/maps/api/place',
        geocoding: 'https://maps.googleapis.com/maps/api/geocode'
        },
        
        // Search radius in meters (default 2.5km)
        searchRadius: parseInt(process.env.SEARCH_RADIUS) || 5000,
        
        // Maximum results per nearby search (Google API limit is 60 with pagination)
        maxResultsPerLocation: 60
    },

    // RATE LIMITING CONFIGURATION
    rateLimit: {
        // Delay between API calls in milliseconds
        // Google Places API has quota limits, so we add delays to avoid throttling
        delayBetweenRequests: parseInt(process.env.RATE_LIMIT_DELAY) || 200,
        
        // Delay before using pagination tokens (Google requires ~2 second delay)
        paginationDelay: 2000,
        
        // Maximum requests per second (calculated from delay)
        maxRequestsPerSecond: function() {
        return 1000 / this.delayBetweenRequests;
        }
    },

  // SEARCH CONFIGURATION
    search: {
        // Maximum number of postal codes allowed per search request
        maxPostalCodesPerRequest: parseInt(process.env.MAX_POSTAL_CODES_PER_REQUEST) || 20,
        
        // Fields to request from Google Places Details API
        // Only request what we need to minimize quota usage and response size
        placeDetailsFields: [
        'name',
        'website',
        'formatted_address',
        'formatted_phone_number',
        'types',
        'business_status',
        'opening_hours'
        ].join(','),
        
        // Business types to exclude (optional - can filter out certain business types)
        excludedTypes: [
        // Example: 'parking', 'atm', 'transit_station'
        // Add types here if you want to exclude them from results
        ]
    },

  // VALIDATION METHODS  
  /**
   * Validates that all required configuration is present
   * @returns {Object} { valid: boolean, errors: string[] }
   */
    validate: function() {
        const errors = [];
        
        // Check Google API key
        if (!this.google.placesApiKey || this.google.placesApiKey === 'your_google_places_api_key_here') {
        errors.push('GOOGLE_PLACES_API_KEY is not configured');
        }
        
        // Check port is valid
        if (isNaN(this.server.port) || this.server.port < 1 || this.server.port > 65535) {
        errors.push('PORT must be a valid number between 1 and 65535');
        }
        
        // Check search radius is reasonable
        if (this.google.searchRadius < 100 || this.google.searchRadius > 50000) {
        errors.push('SEARCH_RADIUS should be between 100 and 50000 meters');
        }
        
        return {
        valid: errors.length === 0,
        errors
        };
    },

    //Logs current configuration (without sensitive data)
    logConfig: function() {
        console.log('Current Configuration:');
        console.log(`Server Port: ${this.server.port}`);
        console.log(`Environment: ${this.server.env}`);
        console.log(`Search Radius: ${this.google.searchRadius}m`);
        console.log(`Rate Limit Delay: ${this.rateLimit.delayBetweenRequests}ms`);
        console.log(`Max Postal Codes: ${this.search.maxPostalCodesPerRequest}`);
        console.log(`API Key Configured: ${this.google.placesApiKey ? '✓ Yes' : '✗ No'}`);
    }
};

// VALIDATE ON LOAD
// Validate configuration when this module is first loaded
const validation = config.validate();
if (!validation.valid) {
  console.error('❌ Configuration Errors:');
  validation.errors.forEach(error => console.error(`   - ${error}`));
  
  if (config.server.isProduction()) {
    // In production, exit if config is invalid
    console.error('Exiting due to configuration errors in production mode');
    process.exit(1);
  } else {
    // In development, just warn
    console.warn('⚠️  Server will start but may not function correctly');
  }
}

// Export the configuration object
module.exports = config;