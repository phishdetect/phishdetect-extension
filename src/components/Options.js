import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons"
export function OptionsSaved(props) {
    return (
        <div className="text-center">
            <FontAwesomeIcon icon={faCheckCircle} className="text-5xl text-green-500" />
            <div className="mt-4">
                {chrome.i18n.getMessage("optionsSaved")}
            </div>
        </div>
    );
}
