(function () {
    var host = window.location.hostname;
    var protocol = window.location.protocol;
    var metaApiBase = document.querySelector('meta[name="milqu-api-base"]');
    var configuredApiBase = metaApiBase ? (metaApiBase.getAttribute('content') || '').trim() : '';
    var isLocalDev = !host || protocol === 'file:' || host === 'localhost' || host === '127.0.0.1' || host === '[::1]';

    window.MILQU_CONFIG = {
        IS_LOCAL_DEV: isLocalDev,
        API_BASE: configuredApiBase
            ? configuredApiBase.replace(/\/$/, '')
            : (isLocalDev
                ? 'http://localhost:5001/api'
                : `${window.location.origin.replace(/\/$/, '')}/api`),
        ADMIN_AUTH_DISABLED: isLocalDev
    };
})();
