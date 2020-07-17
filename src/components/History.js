import React from "react";

export function HistoryAlert(props) {
    return (
        <div className="p-2 mb-2 border-l-4 border-gray-300">{props.dateTime} suspicious visit to <b>{props.url}</b></div>
    );
}
