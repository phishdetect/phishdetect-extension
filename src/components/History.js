import React from "react";

export function HistoryAlert(props) {
    return (
        <div>{props.dateTime} suspicious visit to {props.url}</div>
    );
}
