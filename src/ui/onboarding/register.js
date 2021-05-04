// // Copyright (c) 2018-2021 Claudio Guarnieri.
// //
// // This file is part of PhishDetect.
// //
// // PhishDetect is free software: you can redistribute it and/or modify
// // it under the terms of the GNU General Public License as published by
// // the Free Software Foundation, either version 3 of the License, or
// // (at your option) any later version.
// //
// // PhishDetect is distributed in the hope that it will be useful,
// // but WITHOUT ANY WARRANTY; without even the implied warranty of
// // MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// // GNU General Public License for more details.
// //
// // You should have received a copy of the GNU General Public License
// // along with PhishDetect.  If not, see <https://www.gnu.org/licenses/>.

// function register(event) {
//     $("#nameError").text("");
//     $("#emailError").text("");

//     let name = $("#name").val().trim();
//     let email = $("#email").val().trim();

//     // If it's an empty name, we return.
//     if (isEmpty(name)) {
//         $("#nameError").text(chrome.i18n.getMessage("registerErrorInvalidName"));
//         return;
//     }

//     // If it's an invalid email, we return.
//     if (!isEmail(email)) {
//         $("#emailError").text(chrome.i18n.getMessage("registerErrorInvalidEmail"));
//         return;
//     }

//     name = normalizeName(name);
//     email = normalizeEmail(email);

//     const properties = {
//         method: "POST",
//         body: JSON.stringify({
//             "name": name,
//             "email": email,
//         }),
//         headers: {"Content-Type": "application/json"},
//     };

//     fetch(cfg.getAPIRegisterURL(), properties)
//         .then((response) => response.json())
//         .then(function(data) {
//             if ("error" in data) {
//                 console.log("Failed to register new user: ", data.error);
//                 $("#emailError").text(data.error);
//                 return;
//             }

//             // Save the reitrieved API key.
//             cfg.setApiKey(data.key);

//             // Instruct the background to update the configuration.
//             chrome.runtime.sendMessage({method: "updateConfiguration", config: cfg.config}, function(response) {
//                 // We request an update of indicators, which is also used to
//                 // update the status in the popup.
//                 chrome.runtime.sendMessage({method: "updateIndicators"});

//                 // Then we redirect to the completion page.
//                 getTab(function(tab) {
//                     chrome.tabs.update(tab.id, {url: chrome.extension.getURL(REGISTER_COMPLETED_PAGE)});
//                 });
//             });
//         })
//         .catch(error => {
//             console.log("Failed to register new user: ", error);
//             $("#registrationFailed").text(error).show();
//         });
// }

// document.addEventListener("DOMContentLoaded", cfg.loadFromBackground());
// $("#buttonRegister").click(register);
