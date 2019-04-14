import {useCallback, useEffect, useState} from "react";

export type LoadingState<T> =
  | {status: "loading"}
  | {status: "loaded", data: T}
  | {status: "error", error: any};

/// A React hook that takes a function creating a Promise, and returns
/// a LoadingState object with three possible states: loading, loaded
/// with the resolved data, or error with the error that occurred
export function usePromise<T>(
  promiseFactory: () => Promise<T>,
  deps: ReadonlyArray<any>,
): [LoadingState<T>, () => void] {
  const [state, setState] = useState<LoadingState<T>>({status: "loading"});

  useEffect(() => {
    setState({status: "loading"});
  }, deps);

  useEffect(() => {
    if (state.status === "loading") {
      promiseFactory().then((data) => {
        setState({status: "loaded", data});
      }).catch((error) => {
        // tslint:disable-next-line:no-console
        console.error(error);
        setState({status: "error", error});
      });
    }
  });

  const reload = useCallback(
    () => setState({status: "loading"}),
    [setState],
  );

  return [state, reload];
}
