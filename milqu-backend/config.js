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

function isAdminAuthDisabled() {
    return getBooleanEnv('ADMIN_AUTH_DISABLED', process.env.NODE_ENV !== 'production');
}

module.exports = {
    getRequiredEnv,
    getBooleanEnv,
    isAdminAuthDisabled
};
