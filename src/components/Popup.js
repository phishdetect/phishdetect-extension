import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSmile } from "@fortawesome/free-solid-svg-icons"
export function PopupActivate(props) {
    return (
        <div>
            <p className="mt-4 leading-normal">
                {chrome.i18n.getMessage("popupTokenRequired") + " "}
                <a target="_blank" href="/ui/apikey/apikey.html">
                    {chrome.i18n.getMessage("popupActivate")}
                </a> <FontAwesomeIcon icon={faSmile} className="text-blue" />
            </p>
        </div>
    );
}
