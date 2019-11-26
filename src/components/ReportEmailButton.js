const React = require('react');
function WebmailButton(props) {
    let { className, icon, message } = props;

    return (
        <span id="pd-report" className={`pd-webmail-button ${className}`}>
            <i className={`pd-webmail-button-icon fas ${icon}`}> </i>
            {message}
        </span>
    );
}

export default class ReportEmailButton extends React.Component {
    render() {
        if (this.props.reported) {
            return (
                <WebmailButton className='pd-webmail-reported' icon='fa-check-circle'
                    message={chrome.i18n.getMessage("reportEmailReportedAlready")} />
            );
        } else {
            return (
                <WebmailButton className='pd-webmail-report' icon='fa-fish'
                    message={chrome.i18n.getMessage("reportEmailReport")} />
            );
        }
    }
}
