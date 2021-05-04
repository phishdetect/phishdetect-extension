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

NODE_DEFAULT_URL                      = "https://phishdetect.securitywithoutborders.org";

NODE_API_CONFIG_PATH                  = "/api/config/";
NODE_API_INDICATORS_FETCH_PATH        = "/api/indicators/fetch/";
NODE_API_RECENT_INDICATORS_FETCH_PATH = "/api/indicators/fetch/recent/";
NODE_API_ALERTS_ADD_PATH              = "/api/alerts/add/";
NODE_API_REPORTS_ADD_PATH             = "/api/reports/add/";
NODE_API_AUTH_PATH                    = "/api/auth/";
NODE_API_ANALYZE_HTML_PATH            = "/api/analyze/html/";
NODE_API_ANALYZE_LINK_PATH            = "/api/analyze/link/";
NODE_API_REGISTER_PATH                = "/api/users/register/";
NODE_API_REVIEWS_ADD_PATH             = "/api/reviews/add/";

WARNING_PAGE                          = "ui/warning/warning.html";
REPORT_PAGE                           = "ui/report/report.html";
REPORT_FAILED_PAGE                    = "ui/report/report_failed.html";
REVIEW_PAGE                           = "ui/review/review.html";
REVIEW_FAILED_PAGE                    = "ui/review/review_failed.html";
SCAN_PAGE                             = "ui/scan/scan.html";

INDICATORS_UPDATE_FREQUENCY           = 30;
CONFIG_UPDATE_FREQUENCY               = 60;
ONE_DAY_TIME                          = 24 * 60 * 60 * 1000;
