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

// @author Rob W <http://stackoverflow.com/users/938089/rob-w>
// Demo: var serialized_html = DOMtoString(document);

function DOMtoString(document_root) {
    var html = '',
        node = document_root.firstChild;
    while (node) {
        switch (node.nodeType) {
        case Node.ELEMENT_NODE:
            html += node.outerHTML;
            break;
        case Node.TEXT_NODE:
            html += node.nodeValue;
            break;
        case Node.CDATA_SECTION_NODE:
            html += '<![CDATA[' + node.nodeValue + ']]>';
            break;
        case Node.COMMENT_NODE:
            html += '<!--' + node.nodeValue + '-->';
            break;
        case Node.DOCUMENT_TYPE_NODE:
            // (X)HTML documents are identified by public identifiers
            html += "<!DOCTYPE " + node.name + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '') + (!node.publicId && node.systemId ? ' SYSTEM' : '') + (node.systemId ? ' "' + node.systemId + '"' : '') + '>\n';
            break;
        }
        node = node.nextSibling;
    }
    return html;
}

console.log("[PhishDetect] Loaded scanPage");

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.method && (request.method == "sendPageToNode")) {
            console.log("[PhishDetect] Received request to extract DOM and send it for analysis...");

            const actionUrl = request.actionUrl;
            const html = base64encode(DOMtoString(document));
            const screenshot = request.screenshot;
            const key = request.key;

            const form = $("<form></form>", {
                action: actionUrl,
                method: "POST",
            })
            .css("display", "none")
            .append(
                $("<textarea></textarea>", {id: "html", name: "html"}).text(html),
                $("<textarea></textarea>", {id: "screenshot", name: "screenshot"}).text(screenshot),
                $("<input />", {id: "key", name: "key", value: key}),
            );
            $(document.body).append(form);
            form.submit();
        }
    }
);
