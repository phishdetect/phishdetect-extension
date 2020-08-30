// Copyright (c) 2018-2020 Claudio Guarnieri.
//
// This file is part of PhishDetect.
//
// PhishDetect is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// PhishDetect is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with PhishDetect.  If not, see <https://www.gnu.org/licenses/>.

"use strict";

const vex = require("vex-js");
window.vex = vex;
vex.registerPlugin(require("vex-dialog"));
vex.defaultOptions.className = "vex-theme-default";

import React from "react";
import ReactDOM from "react-dom";
import { renderToString } from "react-dom/server";
import WebmailWarning from "../components/WebmailWarning";
import WebmailLinkWarning from "../components/WebmailLinkWarning";
import WebmailLinkDialog from "../components/WebmailLinkDialog";
import ReportEmailButton from "../components/ReportEmailButton";
import ConfirmationDialog from "../components/ConfirmationDialog";

// A helper to render HTML strings from React components
function renderHTML(component, options) {
    return renderToString(React.createElement(component, options));
}
// A helper to render a React component directly into a DOM element
// This includes attaching any behaviors defined by the component
function renderDOM(component, options, element) {
    ReactDOM.render(React.createElement(component, options), element);
}

// generateWebmailWarning is a helper function used to generate the HTML
// needed to show a warning message inside the supported webmails.
window.generateWebmailWarning = function generateWebmailWarning(alertType) {
    return renderHTML(WebmailWarning, {alertType: alertType});
}
// Renders a button into an existing DOM element and attachs a click handler
// element: the container DOM element
// getEmailPromise: a function that returns a promise resolving to an email
// uid: the unique identifier for the email
window.generateReportEmailButton = function(element, options) {
    return renderDOM(ReportEmailButton, options, element);
}
window.generateConfirmationDialog = function() {
    return renderHTML(ConfirmationDialog);
}

// generateWebmailLinkWarning appends a red warning sign to an HTML element
// (normally a link) to alert the user that what's contained is malicious.
window.generateWebmailLinkWarning = function generateWebmailLinkWarning(element) {
    element.insertAdjacentHTML('afterend', renderHTML(WebmailLinkWarning));
}

// generateWebmailDialog adds a click event handler to the given anchor
// in order to display a dialog offering to open the link safely.
window.generateWebmailDialog = function generateWebmailDialog(anchor) {
    const href = anchor.href;

    // We check if it is an http link.
    if (href.indexOf("http://") != 0 && href.indexOf("https://") != 0) {
        return;
    }

    // We delete data-saferedirecturl.
    // Maybe we should make this optional, but the value of it seems
    // mostly duplicated by using phishdetect.io anyway.
    anchor.removeAttribute("data-saferedirecturl");

    // We add a listener so we can catch the clicks.
    anchor.addEventListener("click", function(event) {
        // We prevent the link from opening.
        event.preventDefault();

        // We safely render the link and preview it in the dialog.
        const message = renderHTML(WebmailLinkDialog, {
            content: chrome.i18n.getMessage("webmailDialog"),
            href: href
        });

        // We spawn a dialog.
        vex.defaultOptions.contentClassName = "w-full";
        vex.dialog.open({
            unsafeMessage: message,
            buttons: [
                // Button to open "Safely".
                $.extend({}, vex.dialog.buttons.YES, {
                    text: chrome.i18n.getMessage("webmailDialogSafely"),
                    className: "pd-webmail-dialog-green-button",
                    click: function($vexContent, event) {
                        this.value = "safe";
                        this.close();
                        return false;
                    }
                }),
                // Button to open "Directly" / "Unsafely".
                $.extend({}, vex.dialog.buttons.YES, {
                    text: chrome.i18n.getMessage("webmailDialogDirectly"),
                    className: "pd-webmail-dialog-red-button",
                    click: function($vexContent, event) {
                        this.value = "unsafe";
                        this.close();
                        return false
                    }
                }),
                // Button to open help page.
                $.extend({}, vex.dialog.buttons.YES, {
                    text: "?",
                    click: function($vexContent, event) {
                        this.value = "help";
                        return false
                    }
                })
            ],
            // Callback to handle button actions.
            callback: function(value) {
                if (value) {
                    // Open the URL through our service.
                    if (value == "safe") {
                        chrome.runtime.sendMessage({method: "scanLink", link: href});
                    // Open the URL directly.
                    } else if (value == "unsafe") {
                        window.open(href);
                    } else if (value == "help") {
                        window.open("https://phishdetect.io/help/");
                    }
                }
            }
        });
    });
}

// Similarly to generateWebmailDialog, generateWebmailPreview creates a
// click event handler. However, it does not provide any option to scan
// the link. This is utilized if the Node has disabled analysis.
window.generateWebmailPreview = function generateWebmailPreview(anchor) {
    const href = anchor.href;

    // We check if it is an http link.
    if (href.indexOf("http://") != 0 && href.indexOf("https://") != 0) {
        return;
    }

    // We delete data-saferedirecturl.
    // Maybe we should make this optional, but the value of it seems
    // mostly duplicated by using phishdetect.io anyway.
    anchor.removeAttribute("data-saferedirecturl");

    // We add a listener so we can catch the clicks.
    anchor.addEventListener("click", function(event) {
        // We prevent the link from opening.
        event.preventDefault();

        // Get URLs.
        // const unsafeUrl = event.srcElement.getAttribute("href");
        const unsafeUrl = href;
        // We sanitize the link and preview it in the dialog.
        const message = renderHTML(WebmailLinkDialog, {
            content: chrome.i18n.getMessage("webmailPreview"),
            href: href
        });

        // We spawn a dialog.
        vex.defaultOptions.contentClassName = "w-full";
        vex.dialog.open({
            unsafeMessage: message,
            buttons: [
                $.extend({}, vex.dialog.buttons.YES, {
                    text: chrome.i18n.getMessage("webmailPreviewContinue"),
                    className: "pd-webmail-dialog-red-button",
                    click: function($vexContent, event) {
                        this.value = "continue";
                        this.close();
                        return false
                    }
                }),
                $.extend({}, vex.dialog.buttons.NO, {
                    text: chrome.i18n.getMessage("webmailPreviewCancel"),
                    click: function($vexContent, event) {
                        this.close();
                        return false
                    }
                }),
                // Button to open help page.
                $.extend({}, vex.dialog.buttons.YES, {
                    text: "?",
                    click: function($vexContent, event) {
                        this.value = "help";
                        return false
                    }
                })
            ],
            // Callback to handle button actions.
            callback: function(value) {
                if (value) {
                    if (value == "continue") {
                        window.open(unsafeUrl);
                    } else if (value == "help") {
                        window.open("https://phishdetect.io/help/");
                    }
                }
            }
        });
    });
}
