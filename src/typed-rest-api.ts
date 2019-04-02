import * as t from "io-ts";
import {failure} from "io-ts/lib/PathReporter";
import * as qs from "query-string";

import getCSRFToken from "@shopify/csrf-token-fetcher";

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

export async function request<Response>(options: RequestOptions<Response>): Promise<Response> {
  const {params, method, responseType} = options;

  let url: string = options.url;
  let body: string | undefined;

  if (params) {
    if (["GET", "DELETE"].includes(method)) {
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

  const result = responseType.decode(data);

  if (result.isRight()) {
    return result.value;
  } else {
    const errors = result.value;

    // tslint:disable:no-console
    console.error(`${method} ${url} responded with invalid value:`);
    console.error(data);
    console.error(`expected type: ${responseType.name}`);
    console.error("Here is the error message from io-ts:");
    console.error(failure(errors).join("\n"));
    // tslint:enable:no-console

    throw Error("invalid API response");
  }
}
