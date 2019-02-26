import * as React from "react";

import {ClientApplication} from "@shopify/app-bridge";
import {History as AppBridgeHistory} from "@shopify/app-bridge/actions";
import {withAppProvider, WithAppProviderProps} from "@shopify/polaris";
import compose from "@shopify/react-compose";
import {Location} from "history";
import {useEffect} from "react";
import {RouteComponentProps, withRouter} from "react-router";

type ComposedProps = WithAppProviderProps & RouteComponentProps;

const QUERY_FILTER_REGEX = /(^|&)(timestamp|protocol|hmac|shop|locale)=[^&]*/g;

const filterQueryString = (queryString: string): string => {
  if (queryString.length > 0) {
    return "?" + queryString.slice(1).replace(QUERY_FILTER_REGEX, "");
  } else {
    return "";
  }
};

const propogateLocation = (appBridge: ClientApplication<{}>, location: Location<{}>) => {
  const appBridgeHistory = AppBridgeHistory.create(appBridge);

  const {pathname, search, hash} = location;

  const path = pathname + filterQueryString(search) + hash;

  appBridgeHistory.dispatch(AppBridgeHistory.Action.REPLACE, path);
};

export const LocationPropagator: React.ComponentType = compose(
  withRouter,
  withAppProvider(),
)(
  ({polaris, location}: ComposedProps) => {
    useEffect(() => {
      propogateLocation(polaris.appBridge, location);
    });

    return null;
  },
);
