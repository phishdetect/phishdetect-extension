var url = location.href;
var html = document.documentElement.outerHTML;

var form = $("<div style=\"display: none;\">" +
    "<form id=\"phishdetect-form\" action=\"" + backend + encodeURIComponent(url) + "\" method=\"POST\">" +
    "<textarea name=\"html\">" + encodeURIComponent(html) + "</textarea>" +
    "<textarea name=\"screenshot\">" + screenshot + "</textarea>" +
    "</form>" +
    "</div>");
$("body").append(form);
$("#phishdetect-form").submit();

undefined;
