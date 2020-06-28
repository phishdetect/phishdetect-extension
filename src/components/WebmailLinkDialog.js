const React = require("react");
export default function WebmailLinkDialog(props) {
    return (
        <span className="pd-webmail-dialog">
            <b>PhishDetect</b><br />
            {props.content} <br />
            <span className="pd-webmail-dialog-url"> {props.href} </span>
        </span>
    );
}
