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
        while (_) try {
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
exports.createFetcher = void 0;
var axios_1 = __importDefault(require("axios"));
var cheerio_1 = __importDefault(require("cheerio"));
var tableMark = " --- ";
var HTMLTableFetcher = /** @class */ (function () {
    function HTMLTableFetcher() {
    }
    HTMLTableFetcher.prototype.fetch = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var response, html, $, tables_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get(url)];
                    case 1:
                        response = _a.sent();
                        html = response.data;
                        $ = cheerio_1.default.load(html);
                        tables_1 = [];
                        $('table').each(function (index, element) {
                            tables_1.push('<table>$(element).html()</table>' || '');
                        });
                        return [2 /*return*/, tables_1];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error fetching table data:', error_1);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return HTMLTableFetcher;
}());
var LogSummaryFetcher = /** @class */ (function () {
    function LogSummaryFetcher() {
    }
    LogSummaryFetcher.prototype.fetch = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var response, text, lines, headers, table, rows, tableData, _i, rows_1, row, rowData, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get(url)];
                    case 1:
                        response = _a.sent();
                        text = response.data;
                        lines = text.split('\n');
                        headers = lines[0].split(';');
                        table = Array(headers.length).fill(tableMark);
                        rows = lines.slice(1);
                        tableData = ["|".concat(headers.join('|'), "|"), "|".concat(table.join('|'), "|")];
                        for (_i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                            row = rows_1[_i];
                            rowData = row.split(';').join('|');
                            tableData.push(rowData);
                        }
                        return [2 /*return*/, tableData];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Error fetching summary log:', error_2);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return LogSummaryFetcher;
}());
function createFetcher(type) {
    if (type === 'html') {
        return new HTMLTableFetcher();
    }
    else if (type === 'log') {
        return new LogSummaryFetcher();
    }
    else {
        throw new Error('Invalid fetcher type');
    }
}
exports.createFetcher = createFetcher;
