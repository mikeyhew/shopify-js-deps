import getCSRFToken from "@shopify/csrf-token-fetcher";
import {array} from "fp-ts";
import * as t from "io-ts";
import {formatValidationError} from "io-ts-reporters";
import {camelCase, fromPairs, snakeCase} from "lodash";
import {stringify as toQueryString} from "query-string";

export type HTTPMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";

export type RequestOptions<Response> = {
  url: string,
  params?: {},
  method: HTTPMethod,
  responseType: t.Type<Response>,
};

// transforms JSON objects, replacing null with undefined
// and switching object keys to camelCase
const deserialize = (value: unknown): unknown => (
  typeof value === "object" ? (
    value === null ? undefined :
    Array.isArray(value) ? value.map(deserialize) :
    fromPairs(Object.entries(value).map(([key, val]) => [camelCase(key), deserialize(val)]))
  ) : value
);

// transform request params, switching object keys to snake_case
const serialize = (value: unknown): unknown => (
  typeof value === "object" ? (
    value === null ? null :
    Array.isArray(value) ? value.map(serialize) :
    fromPairs(Object.entries(value).map(([key, val]) => [snakeCase(key), serialize(val)]))
  ) : value
);

export async function request<Response>(options: RequestOptions<Response>): Promise<Response> {
  const {params, method, responseType} = options;

  let url: string = options.url;
  let body: string | undefined;

  if (params) {
    if (method === "GET" || method === "DELETE") {
      url = url + "?" + toQueryString(params);
    } else {
      body = JSON.stringify(serialize(params));
    }
  }

  const requestOptions: RequestInit = {
    body,
    method,
    headers: {
      "X-CSRF-Token": getCSRFToken(),
    },
  };

  if (method !== "GET" && method !== "DELETE") {
    requestOptions.headers = {
      ...requestOptions.headers,
      "content-type": "application/json",
    };
  }

  const response = await fetch(url, requestOptions);

  if (response.status >= 300) {
    throw Error(`${method} ${url} responded with ${response.status}: ${response.statusText}`);
  }

  let data: unknown;

  if (response.status === 204) {
    // No Content
    data = undefined;
  } else {
    data = await response.json();
  }

  const result = responseType.decode(deserialize(data));

  if (result.isRight()) {
    return result.value;
  } else {
    const errors = result.value;

    // tslint:disable:no-console
    console.error(`Invalid API response from ${method} ${url}`);
    console.error(array.mapOption(errors, formatValidationError).join("\n"));
    // tslint:enable:no-console

    throw Error("invalid API response");
  }
}
