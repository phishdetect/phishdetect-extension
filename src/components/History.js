import React from "react";

export function HistoryAlert(props) {
    let { dateTime, url } = props;

    return (
        <div className="p-2 mb-2 border-l-4 border-gray-300">{dateTime} suspicious visit to <b>{url}</b></div>
    );
}
