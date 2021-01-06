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
    return (
        <div>
            <div className="text-center mb-6">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-5xl" />
                <h1 className="font-normal mt-4"><b>PhishDetect</b> Warning</h1>
            </div>

            {props.dangerous ?
                <div className="border-l-8 border-yellow-lighter mb-8 bg-yellow-lightest text-yellow-darker p-6 rounded-lg leading-normal">
                    <div>We analyzed the link: <span className="font-mono bg-yellow-lighter text-yellow-darkest">{props.url}</span></div>
                    <div className="mt-2">While this is a legitimate BRAND site, we advise caution. Some services offer functionality often abused by malicious attackers. This link leads to one such risky legitimate services, therefore we are not able to automatically determine whether it's safe to proceed.</div>

                    <h4 className="mt-4 mb-2">Following are some examples:</h4>
                    <div>
                        <ul>
                            <li>Services like Google or Microsoft allow for <b>third-party applications</b> to connect to your account (for example, to import invitations into an external calendar service). An attacker might try to obtain access to your account by tricking you into granting a malicious third-party application access to it.</li>
                            <li>Google, for example, offers to host pages at <b>sites.google.com</b>. Attackers often abuse this service to serve their phishing websites.</li>
                        </ul>
                    </div>
                </div>
                :
                <div className="border-l-8 border-red-300 mb-8 bg-red-200 text-red-700 p-6 rounded-lg leading-normal">
                    <h4 className="mt-4">Warnings</h4>

                    {props.warnings.map((warning, index) =>
                        <div>{warning.description}</div>
                    )}
                </div>
            }

            {props.final_url && (props.final_url != props.url) &&
                <div className="mb-8">The original URL <span className="font-mono bg-grey-300">{props.url}</span> redirected to the final URL <span className="font-mono bg-grey-300">{props.final_url}</span></div>
            }

            <div className="mb-4">Following is a screenshot preview of the website.</div>
            <div className="text-center"><img className="rounded-lg shadow-lg w-full border-t-2 border-gray-200" src={props.screenshot} /></div>

            <div className="text-center mt-16 mb-10"><a href={props.url} className="pd-button-red text-xl pl-8 pr-8 pt-4 pb-4" role="button" onClick="return confirm('Are you sure?');"><FontAwesomeIcon icon={faLink} /> Continue anyway at my own risk!</a></div>
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
                <div className="border-l-8 border-green-300 mb-8 bg-green-200 text-green-700 p-6 rounded-lg leading-normal">The domain the link leads to is <b>safelisted</b>! It appears to be a legitimate BRAND site.</div>
            }

            <div className="border-l-8 border-blue-300 mb-8 bg-blue-200 text-blue-700 p-6 rounded-lg leading-normal">
                <div>We analyzed the link: <span className="font-mono bg-blue-300 text-blue-800">{props.url}</span>. No suspicious elements have been found in this page.</div>
                <div className="mt-4"><b>Please notice:</b> this does not guarantee that the page is completely safe (for example, it might evade our detection or identify our service and redirect instead to a legitimate page), please always be cautious.</div>
            </div>

            {props.final_url && (props.final_url != props.url) &&
                <div className="mb-8">The original URL <span className="font-mono bg-grey-300">{props.url}</span> redirected to the final URL <span className="font-mono bg-grey-300">{props.final_url}</span></div>
            }

            <div className="mb-4">Following is a screenshot preview of the website.</div>
            <div className="text-center"><img className="rounded-lg shadow-lg w-full border-t-2 border-gray-200" src={props.screenshot} /></div>

            <div className="text-center mt-16 mb-10"><a href={props.url} className="pd-button-blue text-xl pl-8 pr-8 pt-4 pb-4"><FontAwesomeIcon icon={faLink} /> Continue to the link now</a></div>
        </div>
    );
}
