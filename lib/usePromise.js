"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
/// A React hook that takes a function creating a Promise, and returns
/// a LoadingState object with three possible states: loading, loaded
/// with the resolved data, or error with the error that occurred
function usePromise(promiseFactory) {
    const [state, setState] = react_1.useState({ status: "loading" });
    react_1.useEffect(() => {
        if (state.status === "loading") {
            promiseFactory()
                .then((data) => {
                setState({ status: "loaded", data });
            }).catch((error) => {
                // tslint:disable-next-line:no-console
                console.error(error);
                setState({ status: "error", error });
            });
        }
    });
    const reload = react_1.useCallback(() => setState({ status: "loading" }), [setState]);
    return [state, reload];
}
exports.usePromise = usePromise;
//# sourceMappingURL=usePromise.js.map