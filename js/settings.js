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
    var url = "https://" + getBackendDomain() + "/check/";
    return url;
}
