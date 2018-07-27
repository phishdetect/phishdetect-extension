var url = location.href;
var html = document.documentElement.outerHTML;
var htmlEncoded = btoa(unescape(encodeURIComponent(html)));

var form = document.createElement("div");
form.innerHTML = "<div style=\"display: none;\">" +
"<form id=\"phishdetect-form\" action=\"" + backend + window.btoa(url) + "\" method=\"POST\">" +
"<textarea name=\"html\">" + htmlEncoded + "</textarea>" +
"<textarea name=\"screenshot\">" + screenshot + "</textarea>" +
"</form>" +
"</div>";

document.body.appendChild(form);
document.getElementById("phishdetect-form").submit();

undefined;
