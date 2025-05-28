/**
 * Utility module for automatic date/time formatting based on user locale and timezone
 */

/**
 * Extract user's locale and timezone information from HTTP request
 * @param {Object} request - Express request object
 * @returns {Object} Object containing locale and timezone
 */
function getUserLocaleInfo(request) {
    // Get locale from Accept-Language header
    const acceptLanguage = request.headers['accept-language'];
    let locale = 'en-US'; // default fallback
    
    if (acceptLanguage) {
        // Parse Accept-Language header to get primary locale
        const languages = acceptLanguage.split(',');
        const primaryLang = languages[0].split(';')[0].trim();
        locale = primaryLang;
    }
    
    // Get timezone from headers or use UTC as fallback
    let timezone = 'UTC';
    
    // Check for timezone in various possible headers
    if (request.headers['timezone']) {
        timezone = request.headers['timezone'];
    } else if (request.headers['x-timezone']) {
        timezone = request.headers['x-timezone'];
    } else if (request.headers['tz']) {
        timezone = request.headers['tz'];
    }
    
    return { locale, timezone };
}

/**
 * Determine if a locale typically uses 12-hour time format
 * @param {string} locale - Locale string (e.g., 'en-US', 'ru-RU')
 * @returns {boolean} True if locale uses 12-hour format
 */
function shouldUse12HourFormat(locale) {
    // Countries that typically use 12-hour format
    const twelveHourLocales = [
        'en-US', 'en-CA', 'en-PH', 'en-AU', 'en-NZ', 'en-IN',
        'ar-SA', 'ar-EG', 'ar-AE', 'ar-QA',
        'hi-IN', 'bn-BD', 'ur-PK'
    ];
    
    const languageCode = locale.split('-')[0].toLowerCase();
    const countryCode = locale.split('-')[1]?.toUpperCase();
    
    // Check for exact locale match
    if (twelveHourLocales.includes(locale)) {
        return true;
    }
    
    // Check for country-specific rules
    if (countryCode && ['US', 'CA', 'PH', 'AU', 'NZ', 'IN'].includes(countryCode)) {
        return true;
    }
    
    // Check for language-specific rules (Arabic, Hindi, etc.)
    if (['ar', 'hi', 'bn', 'ur'].includes(languageCode)) {
        return true;
    }
    
    return false; // Default to 24-hour format
}

/**
 * Automatically format date based on user's locale and timezone
 * @param {Date|string|number} date - Date to format
 * @param {string} userLocale - User's locale (e.g., 'en-US', 'ru-RU')
 * @param {string} userTimezone - User's timezone (e.g., 'America/New_York', 'Europe/Moscow')
 * @param {Object} customOptions - Optional custom formatting options
 * @returns {string|null} Formatted date string or null if date is invalid
 */
function autoFormatDate(date, userLocale = 'en-US', userTimezone = 'UTC', customOptions = {}) {
    if (!date) return null;
    
    const dateObj = parseDate(date);
    if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date provided to autoFormatDate:', date);
        return null;
    }
    
    // Default formatting options
    const defaultOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: userTimezone,
        hour12: shouldUse12HourFormat(userLocale)
    };
    
    // Merge with custom options
    const options = { ...defaultOptions, ...customOptions };
    
    try {
        // Format date according to user's locale and timezone
        return new Intl.DateTimeFormat(userLocale, options).format(dateObj);
    } catch (error) {
        // Fallback to ISO format if locale formatting fails
        console.warn(`Failed to format date for locale ${userLocale}:`, error.message);
        return dateObj.toISOString();
    }
}

/**
 * Format date for date-only display (no time)
 * @param {Date|string|number} date - Date to format
 * @param {string} userLocale - User's locale
 * @param {string} userTimezone - User's timezone
 * @returns {string|null} Formatted date string
 */
function formatDateOnly(date, userLocale = 'en-US', userTimezone = 'UTC') {
    return autoFormatDate(date, userLocale, userTimezone, {
        hour: undefined,
        minute: undefined,
        second: undefined
    });
}

/**
 * Format date for time-only display (no date)
 * @param {Date|string|number} date - Date to format
 * @param {string} userLocale - User's locale
 * @param {string} userTimezone - User's timezone
 * @returns {string|null} Formatted time string
 */
function formatTimeOnly(date, userLocale = 'en-US', userTimezone = 'UTC') {
    return autoFormatDate(date, userLocale, userTimezone, {
        year: undefined,
        month: undefined,
        day: undefined
    });
}

/**
 * Parse date from various input formats
 * @param {Date|string|number} dateInput - Date input in various formats
 * @returns {Date} Parsed Date object
 */
function parseDate(dateInput) {
    if (!dateInput) return new Date();
    
    // If it's already a Date object
    if (dateInput instanceof Date) {
        return dateInput;
    }
    
    // If it's a Unix timestamp (number or numeric string)
    if (typeof dateInput === 'number' || (typeof dateInput === 'string' && /^\d+$/.test(dateInput))) {
        const timestamp = parseInt(dateInput);
        // Handle both seconds and milliseconds timestamps
        return new Date(timestamp * (timestamp.toString().length === 10 ? 1000 : 1));
    }
    
    // Try to parse as ISO string or other standard formats
    const parsed = new Date(dateInput);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Format all date fields in an object according to user preferences
 * @param {Object} obj - Object containing date fields to format
 * @param {string} userLocale - User's locale
 * @param {string} userTimezone - User's timezone
 * @param {Array<string>} dateFields - Array of field names that contain dates
 * @returns {Object} Object with formatted date fields
 */
function formatObjectDates(obj, userLocale, userTimezone, dateFields = null) {
    if (!obj) return obj;
    
    const formatted = { ...obj };
    
    // Default list of common date field names
    const defaultDateFields = [
        'change_date', 'created_at', 'updated_at', 'date', 'timestamp', 
        'modified_date', 'deleted_at', 'published_at', 'expires_at',
        'start_date', 'end_date', 'due_date', 'completed_at'
    ];
    
    const fieldsToFormat = dateFields || defaultDateFields;
    
    fieldsToFormat.forEach(field => {
        if (formatted[field]) {
            formatted[field] = autoFormatDate(formatted[field], userLocale, userTimezone);
        }
    });
    
    return formatted;
}

/**
 * Format array of objects with date fields
 * @param {Array<Object>} array - Array of objects to format
 * @param {string} userLocale - User's locale
 * @param {string} userTimezone - User's timezone
 * @param {Array<string>} dateFields - Array of field names that contain dates
 * @returns {Array<Object>} Array with formatted date fields
 */
function formatArrayDates(array, userLocale, userTimezone, dateFields = null) {
    if (!Array.isArray(array)) return array;
    
    return array.map(item => formatObjectDates(item, userLocale, userTimezone, dateFields));
}

/**
 * Create a middleware function for Express that automatically formats dates in responses
 * @param {Array<string>} dateFields - Optional array of specific date fields to format
 * @returns {Function} Express middleware function
 */
function createDateFormatterMiddleware(dateFields = null) {
    return function dateFormatterMiddleware(req, res, next) {
        const { locale, timezone } = getUserLocaleInfo(req);
        
        // Store original json method
        const originalJson = res.json;
        
        // Override json method to format dates automatically
        res.json = function(data) {
            let formattedData = data;
            
            if (Array.isArray(data)) {
                formattedData = formatArrayDates(data, locale, timezone, dateFields);
            } else if (typeof data === 'object' && data !== null) {
                formattedData = formatObjectDates(data, locale, timezone, dateFields);
            }
            
            // Call original json method with formatted data
            return originalJson.call(this, formattedData);
        };
        
        // Store locale info in request for manual use
        req.userLocale = locale;
        req.userTimezone = timezone;
        
        next();
    };
}

module.exports = {
    getUserLocaleInfo,
    autoFormatDate,
    formatDateOnly,
    formatTimeOnly,
    parseDate,
    formatObjectDates,
    formatArrayDates,
    createDateFormatterMiddleware,
    shouldUse12HourFormat
};