function loadOptions() {
    document.getElementById("currentServer").innerText = getBackendDomain();
}

function saveOptions() {
    setBackendDomain(document.querySelector("#server").value);
    loadOptions();
}

function restoreDefaults() {
    setBackendDefaults();
    loadOptions();
}

document.addEventListener("DOMContentLoaded", loadOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("#restoreDefaults").addEventListener("click", restoreDefaults);
