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

function getBrandHTML(brand) {
    // TODO: Need to find a way to dynamically load FontAwesome icon by
    //       brand name.
    if (brand.length == 0) {
        return "";
    }
    return brand[0].toUpperCase() + brand.slice(1).toLowerCase();;
}

export function ScanResultsSafelisted(props) {
    return (
        <div className="grid justify-items-stretch">
            <div className="w-3/5 bg-breezyblue-light shadow-xl rounded-2xl justify-self-center text-center items-center">
                <div className="font-bold tracking-widest mt-10">SCAN RESULT</div>
                <div className="text-5xl font-bold mt-6 mb-6">Looks OK.</div>
                <div className="w-3/5 bg-white p-2 mb-10">{props.url}</div>
                <div>
                    <img className="rounded-b-2xl" src="ok.png" />
                </div>
            </div>

            <div className="text-center mt-10 mb-10"><a href={props.url} className="pd-button-blue text-xl pl-8 pr-8 pt-4 pb-4">Proceed</a></div>

            <div>
                <h1>What happened?</h1>
                <div>
                    {chrome.i18n.getMessage("scanResultsLinkAnalyzed")} <span className="font-mono bg-white text-black font-bold">{props.url}</span>. <span className="text-turquoise font-bold">{chrome.i18n.getMessage("scanResultsSafelisted", [getBrandHTML(props.brand)])}</span>
                </div>
                <div className="mt-4">{chrome.i18n.getMessage("scanResultsRemainCautious")}</div>
            </div>

            {props.final_url && (props.final_url != props.url) &&
                <div className="mb-8">{chrome.i18n.getMessage("scanResultsRedirectedTo")} <span className="font-mono bg-grey-300">{props.final_url}</span></div>
            }

            <div className="mt-6 mb-4 font-bold">{chrome.i18n.getMessage("scanResultsScreenshot")}</div>

            <div className="text-center mb-10"><img className="rounded-2xl shadow-xl w-full border-15 border-turquoise" src={props.screenshot} /></div>
        </div>
    );
}

export function ScanResultsContinue(props) {
    return (
        <div className="grid justify-items-stretch">
            <div className="w-3/5 bg-breezyblue-light shadow-xl rounded-2xl justify-self-center text-center items-center">
                <div className="font-bold tracking-widest mt-10">SCAN RESULT</div>
                <div className="text-5xl font-bold mt-6 mb-6">Looks OK.</div>
                <div className="w-3/5 bg-white p-2 mb-10">{props.url}</div>
                <div>
                    <img className="rounded-b-2xl" src="ok.png" />
                </div>
            </div>

            <div className="text-center mt-10 mb-10"><a href={props.url} className="pd-button-blue text-xl pl-8 pr-8 pt-4 pb-4">Proceed</a></div>

            <div>
                <h1>What happened?</h1>
                <div>
                    {chrome.i18n.getMessage("scanResultsLinkAnalyzed")} <span className="font-mono bg-white text-black font-bold">{props.url}</span>.&nbsp;

                    {props.safelisted ? 
                        <span className="text-turquoise font-bold">{chrome.i18n.getMessage("scanResultsSafelisted", [getBrandHTML(props.brand)])}</span>
                        :
                        <span>{chrome.i18n.getMessage("scanResultsNothingSuspicious")}</span>
                    }

                </div>
                <div className="mt-4">{chrome.i18n.getMessage("scanResultsRemainCautious")}</div>
                <div className="mt-4">{chrome.i18n.getMessage("scanResultsNotStored")} <span id="reportResults">{chrome.i18n.getMessage("scanResultsIfYouThinkWrong")}, <a id="pleaseReport" href="#">{chrome.i18n.getMessage("scanResultsPleaseReport")}</a></span></div>
            </div>

            {props.final_url && (props.final_url != props.url) &&
                <div className="mb-8">{chrome.i18n.getMessage("scanResultsRedirectedTo")} <span className="font-mono bg-grey-300">{props.final_url}</span></div>
            }

            <div className="mt-6 mb-4 font-bold">{chrome.i18n.getMessage("scanResultsScreenshot")}</div>

            {props.safelisted ?
                <div className="text-center mb-10"><img className="rounded-2xl shadow-xl w-full border-15 border-turquoise" src={props.screenshot} /></div>
                :
                <div className="text-center mb-10"><img className="rounded-2xl shadow-xl w-full border-15 border-breezyblue" src={props.screenshot} /></div>
            }
        </div>
    );
}

export function ScanResultsWarning(props) {
    return (
        <div className="grid justify-items-stretch">
            <div className="w-3/5 bg-breezyblue-light shadow-xl rounded-2xl justify-self-center text-center items-center">
                <div className="font-bold tracking-widest mt-10">SCAN RESULT</div>
                <div className="text-5xl font-bold mt-6 mb-6">Be cautious.</div>
                <div className="w-3/5 bg-white p-2 mb-10">{props.url}</div>
                <div>
                    <img className="rounded-b-2xl" src="warning.png" />
                </div>
            </div>

            <div class="mt-10">
                <h1>What happened?</h1>
                <div>{chrome.i18n.getMessage("scanResultsLinkAnalyzed")} <span className="font-mono bg-white text-black font-bold">{props.url}</span></div>
                <div>{chrome.i18n.getMessage("scanResultsSuspicious", [getBrandHTML(props.brand)])}</div>
                
                <h4 className="mt-4 font-bold">{chrome.i18n.getMessage("scanResultsWarnings")}</h4>

                {props.warnings.map((warning, index) =>
                    <div>{warning.description}</div>
                )}

                <div className="mt-4">{chrome.i18n.getMessage("scanResultsStored")}</div>
            </div>

            {props.final_url && (props.final_url != props.url) &&
                <div className="mb-8">{chrome.i18n.getMessage("scanResultsRedirectedTo")} <span className="font-mono bg-grey-300">{props.final_url}</span></div>
            }

            <div className="mt-6 mb-4 font-bold">{chrome.i18n.getMessage("scanResultsScreenshot")}</div>
            <div className="text-center mb-10"><img className="rounded-2xl shadow-xl w-full border-15 border-ripeyellow" src={props.screenshot} /></div>

            <div className="text-center mt-10 mb-10"><a href={props.url} className="" role="button" onClick="return confirm('Are you sure?');">{chrome.i18n.getMessage("scanResultsContinueAtMyOwnRisk")}</a></div>
        </div>
    );
}

export function ScanResultsDanger(props) {
    return (
        <div className="grid justify-items-stretch">
            <div className="w-3/5 bg-breezyblue-light shadow-xl rounded-2xl justify-self-center text-center items-center">
                <div className="font-bold tracking-widest mt-10">SCAN RESULT</div>
                <div className="text-5xl font-bold mt-6 mb-6">This page is unsafe.</div>
                <div className="w-3/5 bg-white p-2 mb-10">{props.url}</div>
                <div>
                    <img className="rounded-b-2xl" src="danger.png" />
                </div>
            </div>


            <div class="mt-10">
                <h1>What happened?</h1>
                <div>{chrome.i18n.getMessage("scanResultsLinkAnalyzed")} <span className="font-mono bg-white text-black font-bold">{props.url}</span></div>
                <div>{chrome.i18n.getMessage("scanResultsBad", [getBrandHTML(props.brand)])}</div>
                
                <h4 className="mt-4 font-bold">{chrome.i18n.getMessage("scanResultsWarnings")}</h4>

                {props.warnings.map((warning, index) =>
                    <div>{warning.description}</div>
                )}

                <div className="mt-4">{chrome.i18n.getMessage("scanResultsStored")}</div>
            </div>

            {props.final_url && (props.final_url != props.url) &&
                <div className="mb-8">{chrome.i18n.getMessage("scanResultsRedirectedTo")} <span className="font-mono bg-grey-300">{props.final_url}</span></div>
            }

            <div className="mt-6 mb-4 font-bold">{chrome.i18n.getMessage("scanResultsScreenshot")}</div>
            <div className="text-center mb-10"><img className="rounded-2xl shadow-xl w-full border-15 border-tomatored" src={props.screenshot} /></div>

            <div className="text-center mt-10 mb-10"><a href={props.url} className="" role="button" onClick="return confirm('Are you sure?');">{chrome.i18n.getMessage("scanResultsContinueAtMyOwnRisk")}</a></div>
        </div>
    );
}
