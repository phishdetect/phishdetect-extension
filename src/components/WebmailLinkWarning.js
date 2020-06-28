const React = require("react");
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons"
export default function WebmailLinkWarning(props) {
    return (
        <span className="pd-webmail-link-warning"
              title={chrome.i18n.getMessage("webmailLinkWarning")}>
            {" "}
            <FontAwesomeIcon icon={faExclamationTriangle} />
        </span>
    );
}
