const React = require('react');
const vex = require('vex-js');
function WebmailButton(props) {
    let { className, icon, message, onClick } = props;

    return (
        <span id="pd-report" className={`pd-webmail-button ${className}`} onClick={onClick}>
            <i className={`pd-webmail-button-icon fas ${icon}`}> </i>
            {message}
        </span>
    );
}

export default class ReportEmailButton extends React.Component {
    constructor(props) {
        super(props);
        let { reported, uid } = props;
        this.state = { reported, uid };
    }

    onClick() {
        if (this.state.reported) {
            return;
        }
        vex.dialog.confirm({
            unsafeMessage: generateConfirmationDialog(),
            callback: this.onConfirm.bind(this)
        });
    }

    onConfirm(ok) {
        // If user clicked cancel, end.
        if (!ok) {
            return;
        }

        var promise = this.props.getEmailPromise();
        if (promise) {
            promise.then(this.onEmailPromiseResolved.bind(this));
        }
    }

    onEmailPromiseResolved(result) {
        this.setState({reported: true});

        chrome.runtime.sendMessage({
            method: "sendRaw",
            rawType: "email",
            rawContent: result,
            identifier: this.state.uid,
        });
    }

    render() {
        if (this.state.reported) {
            return (
                <WebmailButton className='pd-webmail-reported' icon='fa-check-circle'
                    message={chrome.i18n.getMessage("reportEmailReportedAlready")} />
            );
        } else {
            return (
                <WebmailButton className='pd-webmail-report' icon='fa-fish'
                    message={chrome.i18n.getMessage("reportEmailReport")}
                    onClick={this.onClick.bind(this)} />
            );
        }
    }
}
