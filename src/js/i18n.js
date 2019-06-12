$('[data-resource]').each(function() {
  var el = $(this);
  var resourceName = el.data('resource');
  var resourceText = chrome.i18n.getMessage(resourceName);
  el.text(resourceText);
});
