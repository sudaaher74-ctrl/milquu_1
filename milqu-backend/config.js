function getRequiredEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
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
