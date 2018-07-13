function saveOptions(e) {
    e.preventDefault();
    browser.storage.local.set({
        server: document.querySelector("#server").value
    })
}

function loadOptions() {
    function showOptions(result) {
        document.getElementById("current_server").innerText = result.server || "phishdetect.io";
    }

    function onError(error) {
        console.log(error);
    }

    var server = browser.storage.local.get("server");
    server.then(showOptions, onError);
}

document.addEventListener("DOMContentLoaded", loadOptions);
document.querySelector("#form").addEventListener("submit", saveOptions);
