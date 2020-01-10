import { IntlShape } from "react-intl";

import { AttributeFilterInput } from "@saleor/types/globalTypes";
import { maybe, parseBoolean } from "@saleor/misc";
import { createBooleanField } from "@saleor/utils/filters/fields";
import { commonMessages } from "@saleor/intl";
import { IFilter, IFilterElement } from "@saleor/components/Filter";
import {
  createFilterTabUtils,
  createFilterUtils
} from "../../../utils/filters";
import {
  AttributeListUrlFilters,
  AttributeListUrlFiltersEnum,
  AttributeListUrlQueryParams
} from "../../urls";
import { AttributeListFilterOpts } from "../../types";
import messages from "./messages";

export const PRODUCT_FILTERS_KEY = "productFilters";

export enum AttributeFilterKeys {
  availableInGrid = "availableInGrud",
  filterableInDashboard = "filterableInDashboard",
  filterableInStorefront = "filterableInStorefront",
  isVariantOnly = "isVariantOnly",
  valueRequired = "valueRequired",
  visibleInStorefront = "visibleInStorefront"
}

export function getFilterOpts(
  params: AttributeListUrlFilters
): AttributeListFilterOpts {
  return {
    availableInGrid: {
      active: params.availableInGrid !== undefined,
      value: maybe(() => parseBoolean(params.availableInGrid, true))
    },
    filterableInDashboard: {
      active: params.filterableInDashboard !== undefined,
      value: maybe(() => parseBoolean(params.filterableInDashboard, true))
    },
    filterableInStorefront: {
      active: params.filterableInStorefront !== undefined,
      value: maybe(() => parseBoolean(params.filterableInStorefront, true))
    },
    isVariantOnly: {
      active: params.isVariantOnly !== undefined,
      value: maybe(() => parseBoolean(params.isVariantOnly, true))
    },
    valueRequired: {
      active: params.valueRequired !== undefined,
      value: maybe(() => parseBoolean(params.valueRequired, true))
    },
    visibleInStorefront: {
      active: params.visibleInStorefront !== undefined,
      value: maybe(() => parseBoolean(params.visibleInStorefront, true))
    }
  };
}

export function createFilterStructure(
  intl: IntlShape,
  opts: AttributeListFilterOpts
): IFilter<AttributeFilterKeys> {
  return [
    {
      ...createBooleanField(
        AttributeFilterKeys.availableInGrid,
        intl.formatMessage(messages.availableInGrid),
        opts.availableInGrid.value,
        {
          negative: intl.formatMessage(commonMessages.no),
          positive: intl.formatMessage(commonMessages.yes)
        }
      ),
      active: opts.availableInGrid.active
    },
    {
      ...createBooleanField(
        AttributeFilterKeys.filterableInDashboard,
        intl.formatMessage(messages.filterableInDashboard),
        opts.filterableInDashboard.value,
        {
          negative: intl.formatMessage(commonMessages.no),
          positive: intl.formatMessage(commonMessages.yes)
        }
      ),
      active: opts.filterableInDashboard.active
    },
    {
      ...createBooleanField(
        AttributeFilterKeys.filterableInStorefront,
        intl.formatMessage(messages.filterableInStorefront),
        opts.filterableInStorefront.value,
        {
          negative: intl.formatMessage(commonMessages.no),
          positive: intl.formatMessage(commonMessages.yes)
        }
      ),
      active: opts.filterableInStorefront.active
    },
    {
      ...createBooleanField(
        AttributeFilterKeys.isVariantOnly,
        intl.formatMessage(messages.isVariantOnly),
        opts.isVariantOnly.value,
        {
          negative: intl.formatMessage(commonMessages.no),
          positive: intl.formatMessage(commonMessages.yes)
        }
      ),
      active: opts.isVariantOnly.active
    },
    {
      ...createBooleanField(
        AttributeFilterKeys.valueRequired,
        intl.formatMessage(messages.valueRequired),
        opts.valueRequired.value,
        {
          negative: intl.formatMessage(commonMessages.no),
          positive: intl.formatMessage(commonMessages.yes)
        }
      ),
      active: opts.valueRequired.active
    },
    {
      ...createBooleanField(
        AttributeFilterKeys.visibleInStorefront,
        intl.formatMessage(messages.visibleInStorefront),
        opts.visibleInStorefront.value,
        {
          negative: intl.formatMessage(commonMessages.no),
          positive: intl.formatMessage(commonMessages.yes)
        }
      ),
      active: opts.visibleInStorefront.active
    }
  ];
}

export function getFilterVariables(
  params: AttributeListUrlFilters
): AttributeFilterInput {
  return {
    availableInGrid:
      params.availableInGrid !== undefined
        ? parseBoolean(params.availableInGrid, false)
        : undefined,
    search: params.query
  };
}

export function getFilterQueryParam(
  filter: IFilterElement<AttributeFilterKeys>
): AttributeListUrlFilters {
  const { active, name, value } = filter;

  switch (name) {
    case AttributeFilterKeys.availableInGrid:
      if (!active) {
        return {
          availableInGrid: undefined
        };
      }

      return {
        availableInGrid: value[0]
      };

    case AttributeFilterKeys.filterableInDashboard:
      if (!active) {
        return {
          filterableInDashboard: undefined
        };
      }

      return {
        filterableInDashboard: value[0]
      };

    case AttributeFilterKeys.filterableInStorefront:
      if (!active) {
        return {
          filterableInStorefront: undefined
        };
      }

      return {
        filterableInStorefront: value[0]
      };

    case AttributeFilterKeys.isVariantOnly:
      if (!active) {
        return {
          isVariantOnly: undefined
        };
      }

      return {
        isVariantOnly: value[0]
      };

    case AttributeFilterKeys.valueRequired:
      if (!active) {
        return {
          valueRequired: undefined
        };
      }

      return {
        valueRequired: value[0]
      };

    case AttributeFilterKeys.visibleInStorefront:
      if (!active) {
        return {
          visibleInStorefront: undefined
        };
      }

      return {
        visibleInStorefront: value[0]
      };
  }
}

export const {
  deleteFilterTab,
  getFilterTabs,
  saveFilterTab
} = createFilterTabUtils<AttributeListUrlFilters>(PRODUCT_FILTERS_KEY);

export const { areFiltersApplied, getActiveFilters } = createFilterUtils<
  AttributeListUrlQueryParams,
  AttributeListUrlFilters
>(AttributeListUrlFiltersEnum);
