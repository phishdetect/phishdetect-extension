const React = require('react');
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
export default class WebmailWarning extends React.Component {
    getWarningText(eventType) {
        switch(eventType) {
          case "email_sender":
          case "email_sender_domain":
              return chrome.i18n.getMessage("webmailWarningSender");
          case "email_link":
              return chrome.i18n.getMessage("webmailWarningLinks");
        }
    }

    render() {
        return (
            <div id="phishdetect-warning" className="pd-webmail-warning"
                 style={ {paddingTop: '1rem'} }>
                <span style={ {fontSize: '1.125rem'} }>
                    <FontAwesomeIcon icon={faExclamationTriangle} /> <b>PhishDetect</b>
                    {' '}
                    {chrome.i18n.getMessage("webmailWarningWarning")}
                </span>
                <br />
                {chrome.i18n.getMessage("webmailWarningPleaseBeCautious")}
                {' '}
                {this.getWarningText(this.props.eventType)}
                {' '}
                {chrome.i18n.getMessage("webmailWarningHelp")}
                {' '}
                <a style={{textDecoration: 'none'}} href="https://phishdetect.io/help/">
                    <span style={{color: '#6cb2eb'}}>
                        <b>phishdetect.io/help</b>
                    </span>
                </a>
            </div>
        );
    }
}
