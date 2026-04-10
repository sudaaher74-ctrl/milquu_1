(function () {
    var host = window.location.hostname;
    var protocol = window.location.protocol;
    var isLocalDev = !host || protocol === 'file:' || host === 'localhost' || host === '127.0.0.1';

    window.MILQU_CONFIG = {
        IS_LOCAL_DEV: isLocalDev,
        API_BASE: isLocalDev
            ? 'http://localhost:5000/api'
            : `${window.location.origin.replace(/\/$/, '')}/api`,
        ADMIN_AUTH_DISABLED: false,
        ADMIN_LOGIN_EMAIL: ''
    };
})();
