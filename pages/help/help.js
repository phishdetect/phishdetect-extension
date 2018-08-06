document.addEventListener("DOMContentLoaded", function() {
    let backendURL = new URL(getBackendDomain());
    var configuredHTML = "";
    if (backendURL.hostname == "node.phishdetect.io") {
        configuredHTML = "<b>node.phishdetect.io</b> (default configuration)";
    } else {
        configuredHTML = "<b>" + backendURL.hostname + "</b>";
    }
    document.getElementById("configured-domain").innerHTML = configuredHTML;
});
