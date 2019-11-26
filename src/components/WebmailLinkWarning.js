const React = require('react');
export default function WebmailLinkWarning(props) {
    return (
        <span className="pd-webmail-link-warning"
              title={chrome.i18n.getMessage("webmailLinkWarning")}>
            {' '}
            <i className="fas fa-exclamation-triangle"></i>
        </span>
    );
}
