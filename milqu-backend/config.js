require('dotenv').config();

function getRequiredEnv(name, devFallback = null) {
    const value = process.env[name];
    if (!value) {
        if (isProduction()) {
            console.warn(`[WARNING] Missing required environment variable in production: ${name}. App may fail during execution.`);
            return undefined; // Return undefined to avoid immediate startup crash
        } else {
            if (devFallback) {
                console.warn(`[WARNING] Missing environment variable: ${name}. Using development fallback.`);
                return devFallback;
            } else {
                console.warn(`[WARNING] Missing required environment variable: ${name}. No fallback provided.`);
                return undefined;
            }
        }
    }
    return value;
}

function getBooleanEnv(name, defaultValue = false) {
    const value = process.env[name];
    if (value === undefined || value === null || value === '') {
        return defaultValue;
    }

    return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
}

function getListEnv(name, defaultValue = []) {
    const value = process.env[name];
    if (value === undefined || value === null || value === '') {
        return defaultValue;
    }

    return String(value)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function isProduction() {
    return String(process.env.NODE_ENV || '').trim().toLowerCase() === 'production';
}

function isAdminAuthDisabled() {
    return getBooleanEnv('ADMIN_AUTH_DISABLED', false);
}

function getAllowedCorsOrigins() {
    const configuredOrigins = getListEnv('CORS_ORIGIN');
    if (configuredOrigins.length > 0) {
        return configuredOrigins;
    }

    if (!isProduction()) {
        return [
            'http://localhost:3000',
            'http://localhost:5000',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5000',
            'null'
        ];
    }

    return [];
}

module.exports = {
    getRequiredEnv,
    getBooleanEnv,
    getListEnv,
    isProduction,
    isAdminAuthDisabled,
    getAllowedCorsOrigins
};
