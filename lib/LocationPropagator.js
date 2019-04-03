import { History as AppBridgeHistory } from "@shopify/app-bridge/actions";
import { withAppProvider } from "@shopify/polaris";
import compose from "@shopify/react-compose";
import { useEffect } from "react";
import { withRouter } from "react-router";
const QUERY_FILTER_REGEX = /(^|&)(timestamp|protocol|hmac|shop|locale)=[^&]*/g;
const filterQueryString = (queryString) => {
    if (queryString.length > 0) {
        return "?" + queryString.slice(1).replace(QUERY_FILTER_REGEX, "");
    }
    else {
        return "";
    }
};
const propogateLocation = (appBridge, location) => {
    const appBridgeHistory = AppBridgeHistory.create(appBridge);
    const { pathname, search, hash } = location;
    const path = pathname + filterQueryString(search) + hash;
    appBridgeHistory.dispatch(AppBridgeHistory.Action.REPLACE, path);
};
export const LocationPropagator = compose(withRouter, withAppProvider())(({ polaris, location }) => {
    useEffect(() => {
        propogateLocation(polaris.appBridge, location);
    });
    return null;
});
//# sourceMappingURL=LocationPropagator.js.map