"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PathReporter_1 = require("io-ts/lib/PathReporter");
const qs = __importStar(require("query-string"));
const csrf_token_fetcher_1 = __importDefault(require("@shopify/csrf-token-fetcher"));
function request(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { params, method, responseType } = options;
        let url = options.url;
        let body;
        if (params) {
            if (["GET", "DELETE"].includes(method)) {
                url = url + "?" + qs.stringify(params);
            }
            else {
                body = JSON.stringify(params);
            }
        }
        const requestOptions = {
            body,
            method,
            headers: {
                "X-CSRF-Token": csrf_token_fetcher_1.default(),
            },
        };
        const response = yield fetch(url, requestOptions);
        if (response.status >= 300) {
            throw Error(`${method} ${url} responded with ${response.status}: ${response.statusText}`);
        }
        let data;
        if (response.status === 204) {
            // No Content
            data = undefined;
        }
        else {
            data = yield response.json();
        }
        const result = responseType.decode(data);
        if (result.isRight()) {
            return result.value;
        }
        else {
            const errors = result.value;
            // tslint:disable:no-console
            console.error(`${method} ${url} responded with invalid value:`);
            console.error(data);
            console.error(`expected type: ${responseType.name}`);
            console.error("Here is the error message from io-ts:");
            console.error(PathReporter_1.failure(errors).join("\n"));
            // tslint:enable:no-console
            throw Error("invalid API response");
        }
    });
}
exports.request = request;
//# sourceMappingURL=typed-rest-api.js.map