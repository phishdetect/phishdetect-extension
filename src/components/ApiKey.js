import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons"
export function ApiKeySaved(props) {
    return (
        <div className="text-center">
            <FontAwesomeIcon icon={faCheckCircle} className="text-5x1 text-green" />
            <div className="mt-4">
                {chrome.i18n.getMessage("apikeySaved")}
            </div>
        </div>
    );
}

