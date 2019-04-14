import { useCallback, useEffect, useState } from "react";
/// A React hook that takes a function creating a Promise, and returns
/// a LoadingState object with three possible states: loading, loaded
/// with the resolved data, or error with the error that occurred
export function usePromise(promiseFactory, deps) {
    const [state, setState] = useState({ status: "loading" });
    useEffect(() => {
        setState({ status: "loading" });
    }, deps);
    useEffect(() => {
        if (state.status === "loading") {
            promiseFactory().then((data) => {
                setState({ status: "loaded", data });
            }).catch((error) => {
                // tslint:disable-next-line:no-console
                console.error(error);
                setState({ status: "error", error });
            });
        }
    });
    const reload = useCallback(() => setState({ status: "loading" }), [setState]);
    return [state, reload];
}
//# sourceMappingURL=usePromise.js.map