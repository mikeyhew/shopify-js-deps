"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const actions_1 = require("@shopify/app-bridge/actions");
const polaris_1 = require("@shopify/polaris");
const react_compose_1 = __importDefault(require("@shopify/react-compose"));
const react_1 = require("react");
const react_router_1 = require("react-router");
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
    const appBridgeHistory = actions_1.History.create(appBridge);
    const { pathname, search, hash } = location;
    const path = pathname + filterQueryString(search) + hash;
    appBridgeHistory.dispatch(actions_1.History.Action.REPLACE, path);
};
exports.LocationPropagator = react_compose_1.default(react_router_1.withRouter, polaris_1.withAppProvider())(({ polaris, location }) => {
    react_1.useEffect(() => {
        propogateLocation(polaris.appBridge, location);
    });
    return null;
});
//# sourceMappingURL=LocationPropagator.js.map