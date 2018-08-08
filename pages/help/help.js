document.addEventListener("DOMContentLoaded", function() {
    let backendURL = new URL(getBackendDomain());
    let defaultURL = new URL(BACKEND_DEFAULT_DOMAIN);
    var configuredHTML = "<b>" + backendURL.hostname + "</b>";

    if (backendURL.hostname == defaultURL.hostname) {
        configuredHTML += " (default)";
    }

    document.getElementById("configured-domain").innerHTML = configuredHTML;
});
