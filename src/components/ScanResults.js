// Copyright (c) 2018-2021 Claudio Guarnieri.
//
// This file is part of PhishDetect.
//
// PhishDetect is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// PhishDetect is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with PhishDetect.  If not, see <https://www.gnu.org/licenses/>.

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faExclamationTriangle, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export function ScanResultsWarning(props) {
    let warningClass = "pd-yellow-warning";
    let warningMessage = chrome.i18n.getMessage("scanResultsSuspicious");
    if (props.score > 50) {
        warningClass = "pd-red-warning";
        warningMessage = chrome.i18n.getMessage("scanResultsBad");
    }

    return (
        <div>
            <div className="text-center mb-6">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-5xl" />
                <h1 className="font-normal mt-4"><b>PhishDetect</b> Warning</h1>
            </div>

            {props.dangerous ?
                <div className="pd-yellow-warning">
                    <div>{chrome.i18n.getMessage("scanResultsLinkAnalyzed")} <span className="highlight">{props.url}</span></div>
                    <div className="mt-2">{chrome.i18n.getMessage("scanResultsDangerous")}</div>

                    <h4 className="mt-4 mb-2">{chrome.i18n.getMessage("scanResultsDangerousExamples")}</h4>
                    <div>
                        <ul>
                            <li>{chrome.i18n.getMessage("scanResultsDangerousExample1")}</li>
                            <li>{chrome.i18n.getMessage("scanResultsDangerousExample2")}</li>
                        </ul>
                    </div>
                </div>
                :
                <div className={warningClass}>
                    <div>{chrome.i18n.getMessage("scanResultsLinkAnalyzed")} <span className="highlight">{props.url}</span></div>
                    <div>{warningMessage}</div>
                    <h4 className="mt-4 font-bold">{chrome.i18n.getMessage("scanResultsWarnings")}</h4>

                    {props.warnings.map((warning, index) =>
                        <div>{warning.description}</div>
                    )}
                </div>
            }

            {props.final_url && (props.final_url != props.url) &&
                <div className="mb-8">{chrome.i18n.getMessage("scanResultsRedirectedTo")} <span className="font-mono bg-grey-300">{props.final_url}</span></div>
            }

            <div className="mb-4">{chrome.i18n.getMessage("scanResultsScreenshot")}</div>
            <div className="text-center"><img className="rounded-lg shadow-lg w-full border-t-2 border-gray-200" src={props.screenshot} /></div>

            <div className="text-center mt-16 mb-10"><a href={props.url} className="pd-button-red text-xl pl-8 pr-8 pt-4 pb-4" role="button" onClick="return confirm('Are you sure?');"><FontAwesomeIcon icon={faLink} /> {chrome.i18n.getMessage("scanResultsContinueAtMyOwnRisk")}</a></div>
        </div>
    );
}

export function ScanResultsContinue(props) {
    return (
        <div>
            <div className="text-center mb-6">
                <FontAwesomeIcon icon={faCheckCircle} className="text-5xl" />
                <h1 className="font-normal mt-4"><b>PhishDetect</b> OK</h1>
            </div>

            {props.safelisted &&
                <div className="border-l-8 border-green-300 mb-8 bg-green-200 text-green-700 p-6 rounded-lg leading-normal">{chrome.i18n.getMessage("scanResultsSafelisted")}</div>
            }

            <div className="border-l-8 border-blue-300 mb-8 bg-blue-200 text-blue-700 p-6 rounded-lg leading-normal">
                <div>{chrome.i18n.getMessage("scanResultsLinkAnalyzed")} <span className="font-mono bg-blue-300 text-blue-800">{props.url}</span>. </div>
                <div className="mt-4">{chrome.i18n.getMessage("scanResultsRemainCautious")}</div>
            </div>

            {props.final_url && (props.final_url != props.url) &&
                <div className="mb-8">{chrome.i18n.getMessage("scanResultsRedirectedTo")} <span className="font-mono bg-grey-300">{props.final_url}</span></div>
            }

            <div className="mb-4">{chrome.i18n.getMessage("scanResultsScreenshot")}</div>
            <div className="text-center"><img className="rounded-lg shadow-lg w-full border-t-2 border-gray-200" src={props.screenshot} /></div>

            <div className="text-center mt-16 mb-10"><a href={props.url} className="pd-button-blue text-xl pl-8 pr-8 pt-4 pb-4"><FontAwesomeIcon icon={faLink} /> {chrome.i18n.getMessage("scanResultsContinueNow")}</a></div>
        </div>
    );
}