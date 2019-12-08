const React = require('react');
export default function ConfirmationDialog(props) {
    return (
        <span>
          <b>PhishDetect</b><br />
          {chrome.i18n.getMessage("reportEmailConfirm")}
        </span>
    );
}
