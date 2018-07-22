var url = location.href;
var html = document.documentElement.outerHTML;
var htmlEncoded = btoa(unescape(encodeURIComponent(html)));

var form = $("<div style=\"display: none;\">" +
    "<form id=\"phishdetect-form\" action=\"" + backend + window.btoa(url) + "\" method=\"POST\">" +
    "<textarea name=\"html\">" + htmlEncoded + "</textarea>" +
    "<textarea name=\"screenshot\">" + screenshot + "</textarea>" +
    "</form>" +
    "</div>");
$("body").append(form);
$("#phishdetect-form").submit();

undefined;
