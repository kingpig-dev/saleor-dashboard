import { IntlShape } from "react-intl";

import { UseNavigatorResult } from "@saleor/hooks/useNavigator";
import { OrderDraftCreate } from "@saleor/orders/types/OrderDraftCreate";
import { MutationFunction } from "react-apollo";
import { QuickSearchAction, QuickSearchMode } from "../types";
import getCommandModeActions from "./commands";
import getDefaultModeActions from "./default";
import getOrdersModeActions from "./orders";
import { ActionQueries } from "./types";

function getModeActions(
  mode: QuickSearchMode,
  query: string,
  intl: IntlShape,
  queries: ActionQueries,
  cbs: {
    navigate: UseNavigatorResult;
    createOrder: MutationFunction<OrderDraftCreate, {}>;
  }
): QuickSearchAction[] {
  switch (mode) {
    case "commands":
      return getCommandModeActions(query, intl, cbs.navigate, cbs.createOrder);
    case "orders":
      return getOrdersModeActions(query, intl, cbs.navigate, queries.order);
    default:
      return getDefaultModeActions(query, intl, cbs.navigate, cbs.createOrder);
  }
}

export default getModeActions;
