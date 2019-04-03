var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import getCSRFToken from "@shopify/csrf-token-fetcher";
import { array } from "fp-ts";
import { formatValidationError } from "io-ts-reporters";
import { camelCase, fromPairs, snakeCase } from "lodash";
import { stringify as toQueryString } from "query-string";
// transforms JSON objects, replacing null with undefined
// and switching object keys to camelCase
const deserialize = (value) => (typeof value === "object" ? (value === null ? undefined :
    Array.isArray(value) ? value.map(deserialize) :
        fromPairs(Object.entries(value).map(([key, val]) => [camelCase(key), deserialize(val)]))) : value);
// transform request params, switching object keys to snake_case
const serialize = (value) => (typeof value === "object" ? (value === null ? null :
    Array.isArray(value) ? value.map(serialize) :
        fromPairs(Object.entries(value).map(([key, val]) => [snakeCase(key), serialize(val)]))) : value);
export function request(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { params, method, responseType } = options;
        let url = options.url;
        let body;
        if (params) {
            if (method === "GET" || method === "DELETE") {
                url = url + "?" + toQueryString(params);
            }
            else {
                body = JSON.stringify(serialize(params));
            }
        }
        const requestOptions = {
            body,
            method,
            headers: {
                "X-CSRF-Token": getCSRFToken(),
            },
        };
        if (method !== "GET" && method !== "DELETE") {
            requestOptions.headers = Object.assign({}, requestOptions.headers, { "content-type": "application/json" });
        }
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
        const result = responseType.decode(deserialize(data));
        if (result.isRight()) {
            return result.value;
        }
        else {
            const errors = result.value;
            // tslint:disable:no-console
            console.error(`Invalid API response from ${method} ${url}`);
            console.error(array.mapOption(errors, formatValidationError).join("\n"));
            // tslint:enable:no-console
            throw Error("invalid API response");
        }
    });
}
//# sourceMappingURL=typed-rest-api.js.map