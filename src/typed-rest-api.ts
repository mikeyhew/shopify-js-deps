import * as t from "io-ts";
import * as qs from "query-string";

import getCSRFToken from "@shopify/csrf-token-fetcher";
import {array} from "fp-ts";
import {formatValidationError} from "io-ts-reporters";

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

// replaces null with undefined in JSON objects
const replaceNullWithUndefined = (value: unknown): unknown => {
  if (typeof value === "object") {
    if (value === null) {
      return undefined;
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        value[i] = replaceNullWithUndefined(value[i]);
      }

      return value;
    }

    for (const key of Object.keys(value)) {
      const object = value as {[key: string]: unknown};

      object[key] = replaceNullWithUndefined(object[key]);
    }

    return value;
  }

  if (value === null) {
    return undefined;
  }

  return value;
};

export async function request<Response>(options: RequestOptions<Response>): Promise<Response> {
  const {params, method, responseType} = options;

  let url: string = options.url;
  let body: string | undefined;

  if (params) {
    if (method === "GET" || method === "DELETE") {
      url = url + "?" + qs.stringify(params);
    } else {
      body = JSON.stringify(params);
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

  const result = responseType.decode(replaceNullWithUndefined(data));

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
