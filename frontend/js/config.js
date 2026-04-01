(function () {
    var host = window.location.hostname;
    var protocol = window.location.protocol;
    var isLocalDev = !host || protocol === 'file:' || host === 'localhost' || host === '127.0.0.1';

    window.MILQU_CONFIG = {
        API_BASE: isLocalDev
            ? 'http://localhost:5000/api'
            : `${window.location.origin.replace(/\/$/, '')}/api`,
        ADMIN_LOGIN_EMAIL: 'sudaaher74@gmail.com'
    };
})();
