export declare type LoadingState<T> = {
    status: "loading";
} | {
    status: "loaded";
    data: T;
} | {
    status: "error";
    error: any;
};
export declare function usePromise<T>(promiseFactory: () => Promise<T>): [LoadingState<T>, () => void];
//# sourceMappingURL=usePromise.d.ts.map