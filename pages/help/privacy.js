document.addEventListener("DOMContentLoaded", function() {
    let backendURL = new URL(getBackendDomain());
    let defaultURL = new URL(BACKEND_DEFAULT_DOMAIN);
    var configuredHTML = "";

    if (backendURL.hostname == defaultURL.hostname) {
        configuredHTML = "You are using the default PhishDetect Node located at <b>" + backendURL.hostname + "</b>, operated by the creators of PhishDetect.";
    } else {
        configuredHTML = "You are using a custom PhishDetect Node located at <b>" + backendURL.hostname + "</b>. Please refer to its operator for additional privacy informations.";
    }
    document.getElementById("configured-domain").innerHTML = configuredHTML;
});
