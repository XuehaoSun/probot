"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentOnPr = exports.generateProgressDetailsMarkdown = exports.generateProgressDetailsCLI = void 0;
var satisfy_expected_checks_1 = require("./satisfy_expected_checks");
var axios_1 = __importDefault(require("axios"));
var config_getter_1 = require("./config_getter");
var statusToMark = function (check, postedChecks) {
    if (check in postedChecks) {
        if (postedChecks[check].conclusion === "success") {
            return "✅";
        }
        if (postedChecks[check].conclusion === "failure") {
            return "❌";
        }
        if (postedChecks[check].conclusion === "cancelled") {
            return "🚫";
        }
        if (postedChecks[check].conclusion === null) {
            return "⌛"; // pending
        }
    }
    return "❓";
};
var statusToLink = function (check, postedChecks) {
    if (check in postedChecks) {
        var checkData = postedChecks[check];
        // assert(checkData.name === check)
        // if the check name contains the character "|", it will break the table rendering
        var sanitizedCheck = check.replace(/\|/g, "\\|");
        return "[".concat(sanitizedCheck, "](").concat(checkData.details_url, ")");
    }
    return check;
};
var parseStatus = function (check, postedChecks) {
    if (check in postedChecks) {
        var checkData = postedChecks[check];
        if (checkData.conclusion === null) {
            return checkData.status;
        }
        else {
            return checkData.conclusion;
        }
    }
    return "no_status";
};
var getRunID = function (url) {
    var regex = /runs\/(\d+)\/job/;
    var match = url.match(regex);
    if (match) {
        var runsNumber = match[1];
        return parseInt(runsNumber, 10);
    }
    else {
        return NaN;
    }
};
function parseDownloadUrl(detailURL) {
    return __awaiter(this, void 0, void 0, function () {
        var runID, githubRestArtifactApiUrl, response, githubActionsArtifactsData, artifactCount, artifactValue, urlDict, _i, artifactValue_1, item, artifactDownloadUrl, statusCode, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    runID = getRunID(detailURL);
                    githubRestArtifactApiUrl = "https://api.github.com/repos/intel/intel-extension-for-transformers/actions/runs/".concat(runID, "/artifacts");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, axios_1.default.get(githubRestArtifactApiUrl)];
                case 2:
                    response = _a.sent();
                    githubActionsArtifactsData = response.data;
                    artifactCount = githubActionsArtifactsData.total_count;
                    artifactValue = githubActionsArtifactsData.artifacts;
                    if (artifactCount === 0) {
                        return [2 /*return*/, {}];
                    }
                    urlDict = {};
                    _i = 0, artifactValue_1 = artifactValue;
                    _a.label = 3;
                case 3:
                    if (!(_i < artifactValue_1.length)) return [3 /*break*/, 6];
                    item = artifactValue_1[_i];
                    artifactDownloadUrl = "https://github.com/intel/intel-extension-for-transformers/actions/runs/".concat(runID, "/artifacts/").concat(item.id);
                    return [4 /*yield*/, (0, config_getter_1.checkURL)("https://api.github.com/repos/intel/intel-extension-for-transformers/actions/artifacts/".concat(item.id))];
                case 4:
                    statusCode = _a.sent();
                    urlDict[item.name] = undefined;
                    if (statusCode === 200) {
                        urlDict[item.name] = artifactDownloadUrl;
                    }
                    else {
                        console.log("".concat(artifactDownloadUrl, " invalid"));
                    }
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/, urlDict];
                case 7:
                    error_1 = _a.sent();
                    console.error('Error fetching artifact information:', error_1);
                    return [2 /*return*/, {}];
                case 8: return [2 /*return*/];
            }
        });
    });
}
var generateProgressDetailsCLI = function (subprojects, postedChecks) {
    var progress = "";
    // these are the required subprojects
    subprojects.forEach(function (subproject) {
        progress += "Summary for sub-project ".concat(subproject.id, "\n");
        // for padding
        var longestLength = Math.max.apply(Math, (subproject.checks.map(function (check) { return check.length; })));
        subproject.checks.forEach(function (check) {
            var mark = statusToMark(check, postedChecks);
            var status = parseStatus(check, postedChecks);
            progress += "".concat(check.padEnd(longestLength, ' '), " | ").concat(mark, " | ").concat(status.padEnd(12, ' '), "\n");
        });
        progress += "\n\n";
    });
    progress += "\n";
    progress += "## Currently received checks\n";
    var longestLength = 1;
    for (var availableCheck in postedChecks) {
        longestLength = Math.max(longestLength, availableCheck.length);
    }
    for (var availableCheck in postedChecks) {
        var mark = statusToMark(availableCheck, postedChecks);
        var status_1 = parseStatus(availableCheck, postedChecks);
        progress += "".concat(availableCheck.padEnd(longestLength, ' '), " | ").concat(mark, " | ").concat(status_1.padEnd(12, ' '), "\n");
    }
    progress += "\n";
    return progress;
};
exports.generateProgressDetailsCLI = generateProgressDetailsCLI;
var generateProgressDetailsMarkdown = function (subprojects, postedChecks) { return __awaiter(void 0, void 0, void 0, function () {
    var progress, _i, subprojects_1, subproject, checkResult, subprojectEmoji, _a, _b, check, link, status_2, mark, artifactLinkDict, artifactLink;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                progress = "## Groups summary\n\n";
                _i = 0, subprojects_1 = subprojects;
                _c.label = 1;
            case 1:
                if (!(_i < subprojects_1.length)) return [3 /*break*/, 9];
                subproject = subprojects_1[_i];
                checkResult = (0, satisfy_expected_checks_1.getChecksResult)(subproject.checks, postedChecks);
                subprojectEmoji = "🟡";
                if (checkResult === "all_passing") {
                    subprojectEmoji = "🟢";
                }
                else if (checkResult === "has_failure") {
                    subprojectEmoji = "🔴";
                }
                // generate the markdown table
                progress += "<details>\n\n";
                progress += "<summary><b>".concat(subprojectEmoji, " ").concat(subproject.id, "</b></summary>\n\n");
                progress += "| Check ID | Status | Error details |     |\n";
                progress += "| -------- | ------ | ---- | --- |\n";
                _a = 0, _b = subproject.checks;
                _c.label = 2;
            case 2:
                if (!(_a < _b.length)) return [3 /*break*/, 7];
                check = _b[_a];
                link = statusToLink(check, postedChecks);
                status_2 = parseStatus(check, postedChecks);
                mark = statusToMark(check, postedChecks);
                if (!(status_2 === "failure")) return [3 /*break*/, 5];
                return [4 /*yield*/, parseDownloadUrl(postedChecks[check].details_url)];
            case 3:
                artifactLinkDict = _c.sent();
                return [4 /*yield*/, (0, config_getter_1.getArtifactName)(check, artifactLinkDict)];
            case 4:
                artifactLink = _c.sent();
                if (artifactLink === undefined) {
                    progress += "| ".concat(link, " | ").concat(status_2, " |  | ").concat(mark, " |\n");
                }
                else {
                    progress += "| ".concat(link, " | ").concat(status_2, " | [download](").concat(artifactLink, ") | ").concat(mark, " |\n");
                }
                return [3 /*break*/, 6];
            case 5:
                progress += "| ".concat(link, " | ").concat(status_2, " |  | ").concat(mark, " |\n");
                _c.label = 6;
            case 6:
                _a++;
                return [3 /*break*/, 2];
            case 7:
                progress += "\nThese checks are required after the changes to `".concat(subproject.paths.join("`, `"), "`.\n");
                progress += "\n</details>\n\n";
                _c.label = 8;
            case 8:
                _i++;
                return [3 /*break*/, 1];
            case 9:
                ;
                return [2 /*return*/, progress];
        }
    });
}); };
exports.generateProgressDetailsMarkdown = generateProgressDetailsMarkdown;
var PR_COMMENT_START = "<!-- checkgroup-comment-start -->";
function formPrComment(result, inputs, subprojects, postedChecks) {
    return __awaiter(this, void 0, void 0, function () {
        var parsedConclusion, hasFailed, conclusionEmoji, lightning, failedMesage, progressDetails;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parsedConclusion = result.replace("_", " ");
                    // capitalize
                    parsedConclusion = parsedConclusion.charAt(0).toUpperCase() + parsedConclusion.slice(1);
                    hasFailed = result === "has_failure";
                    conclusionEmoji = (result === "all_passing") ? "🟢" : (hasFailed) ? "🔴" : "🟡";
                    lightning = (result === "all_passing") ? "⚡" : (hasFailed) ? "⛈️" : "🌩️";
                    failedMesage = ("> **Warning**\n> "
                        + " If you do not have the access to re-run the CI-Summary bot, please contact ".concat(inputs.maintainers, " for help.")
                        + " If you push a new commit, all of the workflow will be re-triggered.\n\n");
                    return [4 /*yield*/, (0, exports.generateProgressDetailsMarkdown)(subprojects, postedChecks)];
                case 1:
                    progressDetails = _a.sent();
                    return [2 /*return*/, (PR_COMMENT_START
                            + "\n# ".concat(lightning, " Required checks status: ").concat(parsedConclusion, " ").concat(conclusionEmoji, "\n\n")
                            + ((hasFailed) ? failedMesage : "")
                            + ((subprojects.length) ? progressDetails : "No groups match the files changed in this PR.\n\n")
                            + "---\n\n"
                            + "Thank you for your contribution! 💜\n\n"
                            + "> **Note**\n> This comment is automatically generated and updates for ".concat(inputs.timeout, " minutes every ").concat(inputs.interval, " seconds.")
                            + " If you have any other questions, contact ".concat(inputs.owner, " for help."))];
            }
        });
    });
}
function getPrComment(context) {
    return __awaiter(this, void 0, void 0, function () {
        var params, commentsRes, _i, _a, comment;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    params = context.issue();
                    return [4 /*yield*/, context.octokit.rest.issues.listComments(params)];
                case 1:
                    commentsRes = _b.sent();
                    for (_i = 0, _a = commentsRes.data; _i < _a.length; _i++) {
                        comment = _a[_i];
                        if (comment.body.includes(PR_COMMENT_START)) {
                            return [2 /*return*/, { id: comment.id, body: comment.body }];
                        }
                    }
                    return [2 /*return*/, { id: 0, body: "" }];
            }
        });
    });
}
function commentOnPr(context, result, inputs, subprojects, postedChecks) {
    return __awaiter(this, void 0, void 0, function () {
        var existingData, newComment;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getPrComment(context)];
                case 1:
                    existingData = _a.sent();
                    context.log.debug("existingData: ".concat(JSON.stringify(existingData)));
                    return [4 /*yield*/, formPrComment(result, inputs, subprojects, postedChecks)];
                case 2:
                    newComment = _a.sent();
                    if (existingData.body === newComment) {
                        console.log("Comments are the same as before, skip😊");
                        return [2 /*return*/];
                    }
                    if (!(existingData.id === 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, context.octokit.issues.createComment(context.issue({ body: newComment }))];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, context.octokit.issues.updateComment(context.repo({ body: newComment, comment_id: existingData.id }))];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.commentOnPr = commentOnPr;
