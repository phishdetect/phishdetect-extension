const BACKEND_DEFAULT_DOMAIN = "https://phishdetect.io";

function setBackendDomain(domain) {
    localStorage.setItem("server", domain);
}

function setBackendDefaults() {
    localStorage.setItem("server", BACKEND_DEFAULT_DOMAIN);
}

function getBackendDomain() {
    var server = localStorage.getItem("server") || BACKEND_DEFAULT_DOMAIN;
    return server;
}

function getBackendURL() {
    var url = getBackendDomain() + "/check/";
    return url;
}

/*module.exports = {
    setBackendDomain,
    setBackendDefaults,
    getBackendDomain,
    getBackendURL,
}*/
