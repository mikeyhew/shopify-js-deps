import * as t from "io-ts";
export declare type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export declare type RequestOptions<Response> = {
    url: string;
    params?: {};
    method: HTTPMethod;
    responseType: t.Type<Response>;
};
export declare function request<Response>(options: RequestOptions<Response>): Promise<Response>;
//# sourceMappingURL=typed-rest-api.d.ts.map