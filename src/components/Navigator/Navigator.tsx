import Dialog from "@material-ui/core/Dialog";
import Downshift from "downshift";
import hotkeys from "hotkeys-js";
import React from "react";
import { useIntl } from "react-intl";
import cmp from "semver-compare";

import { APP_VERSION } from "@saleor/config";
import useLocalStorage from "@saleor/hooks/useLocalStorage";
import useNotifier from "@saleor/hooks/useNotifier";
import {
  getActions,
  getCatalog,
  getCustomers,
  getViews,
  hasActions,
  hasCatalog,
  hasCustomers,
  hasViews
} from "./modes/utils";
import NavigatorInput from "./NavigatorInput";
import NavigatorSection from "./NavigatorSection";
import { QuickSearchAction } from "./types";
import useQuickSearch from "./useQuickSearch";

const navigatorHotkey = "ctrl+k, command+k";
const navigatorNotificationStorageKey = "notifiedAboutNavigator";

function getItemOffset(
  actions: QuickSearchAction[],
  cbs: Array<typeof getViews>
): number {
  return cbs.reduce((acc, cb) => cb(actions).length + acc, 0);
}

const Navigator: React.FC = () => {
  const [visible, setVisible] = React.useState(false);
  const input = React.useRef(null);
  const [query, mode, change, actions] = useQuickSearch(visible, input);
  const intl = useIntl();
  const notify = useNotifier();
  const [notifiedAboutNavigator, setNotifiedAboutNavigator] = useLocalStorage(
    navigatorNotificationStorageKey,
    false
  );

  React.useEffect(() => {
    hotkeys(navigatorHotkey, event => {
      event.preventDefault();
      setVisible(!visible);
    });

    if (cmp(APP_VERSION, "2.1.0") !== 1 && !notifiedAboutNavigator) {
      notify({
        text: intl.formatMessage({
          defaultMessage:
            "Our new feature to help you with your daily task. Run Navigator using Ctrl+K shortcut. (Cmd+K for Mac users)",
          description: "navigator notification"
        }),
        title: intl.formatMessage({
          defaultMessage: "Navigator is here to help",
          description: "navigator notification title"
        })
      });
      setNotifiedAboutNavigator(true);
    }

    return () => hotkeys.unbind(navigatorHotkey);
  }, []);

  return (
    <Dialog
      open={visible}
      onClose={() => setVisible(false)}
      fullWidth
      maxWidth="sm"
    >
      <Downshift
        itemToString={(item: QuickSearchAction) => (item ? item.label : "")}
        onSelect={(item: QuickSearchAction) => {
          setVisible(false);
          item.onClick();
        }}
        onInputValueChange={value =>
          change({
            target: {
              name: "query",
              value
            }
          })
        }
        defaultHighlightedIndex={0}
      >
        {({ getInputProps, getItemProps, highlightedIndex }) => (
          <div>
            <NavigatorInput
              mode={mode}
              value={query}
              {...getInputProps({
                value: query
              })}
              ref={input}
            />
            {hasViews(actions) && (
              <NavigatorSection
                label={intl.formatMessage({
                  defaultMessage: "Navigate to",
                  description: "navigator section header"
                })}
                getItemProps={getItemProps}
                highlightedIndex={highlightedIndex}
                items={getViews(actions)}
                offset={0}
              />
            )}
            {hasActions(actions) && (
              <NavigatorSection
                label={intl.formatMessage({
                  defaultMessage: "Quick Actions",
                  description: "navigator section header"
                })}
                getItemProps={getItemProps}
                highlightedIndex={highlightedIndex}
                items={getActions(actions)}
                offset={getItemOffset(actions, [getViews])}
              />
            )}
            {hasCustomers(actions) && (
              <NavigatorSection
                label={intl.formatMessage({
                  defaultMessage: "Search in Customers",
                  description: "navigator section header"
                })}
                getItemProps={getItemProps}
                highlightedIndex={highlightedIndex}
                items={getCustomers(actions)}
                offset={getItemOffset(actions, [getViews, getActions])}
              />
            )}
            {hasCatalog(actions) && (
              <NavigatorSection
                label={intl.formatMessage({
                  defaultMessage: "Search in Catalog",
                  description: "navigator section header"
                })}
                getItemProps={getItemProps}
                highlightedIndex={highlightedIndex}
                items={getCatalog(actions)}
                offset={0}
              />
            )}
          </div>
        )}
      </Downshift>
    </Dialog>
  );
};

export default Navigator;
