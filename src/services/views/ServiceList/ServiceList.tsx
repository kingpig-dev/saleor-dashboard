import React from "react";

import useListSettings from "@saleor/hooks/useListSettings";
import useNavigator from "@saleor/hooks/useNavigator";
import useNotifier from "@saleor/hooks/useNotifier";
import usePaginator, {
  createPaginationState
} from "@saleor/hooks/usePaginator";
import { useIntl } from "react-intl";

import DeleteFilterTabDialog from "@saleor/components/DeleteFilterTabDialog";
import SaveFilterTabDialog, {
  SaveFilterTabDialogFormData
} from "@saleor/components/SaveFilterTabDialog";
import { configurationMenuUrl } from "@saleor/configuration";
import useShop from "@saleor/hooks/useShop";
import { commonMessages } from "@saleor/intl";
import { getMutationState, maybe } from "@saleor/misc";
import { ListViews } from "@saleor/types";
import ServiceListPage from "../../components/ServiceListPage";
import { ServiceListQuery } from "../../queries";
import {
  serviceListUrl,
  ServiceListUrlDialog,
  ServiceListUrlFilters,
  ServiceListUrlQueryParams,
  serviceUrl
} from "../../urls";
import {
  areFiltersApplied,
  deleteFilterTab,
  getActiveFilters,
  getFilterTabs,
  getFilterVariables,
  saveFilterTab
} from "./filter";

interface ServiceListProps {
  params: ServiceListUrlQueryParams;
}

export const ServiceList: React.StatelessComponent<ServiceListProps> = ({
  params
}) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  const paginate = usePaginator();
  const { updateListSettings, settings } = useListSettings(
    ListViews.STAFF_MEMBERS_LIST
  );
  const intl = useIntl();
  const shop = useShop();

  const tabs = getFilterTabs();

  const currentTab =
    params.activeTab === undefined
      ? areFiltersApplied(params)
        ? tabs.length + 1
        : 0
      : parseInt(params.activeTab, 0);

  const changeFilterField = (filter: ServiceListUrlFilters) =>
    navigate(
      serviceListUrl({
        ...getActiveFilters(params),
        ...filter,
        activeTab: undefined
      })
    );

  const closeModal = () =>
    navigate(
      serviceListUrl({
        ...params,
        action: undefined,
        ids: undefined
      }),
      true
    );

  const openModal = (action: ServiceListUrlDialog, ids?: string[]) =>
    navigate(
      serviceListUrl({
        ...params,
        action,
        ids
      })
    );

  const handleTabChange = (tab: number) => {
    navigate(
      serviceListUrl({
        activeTab: tab.toString(),
        ...getFilterTabs()[tab - 1].data
      })
    );
  };

  const handleTabDelete = () => {
    deleteFilterTab(currentTab);
    navigate(serviceListUrl());
  };

  const handleTabSave = (data: SaveFilterTabDialogFormData) => {
    saveFilterTab(data.name, getActiveFilters(params));
    handleTabChange(tabs.length + 1);
  };

  const paginationState = createPaginationState(settings.rowNumber, params);
  const queryVariables = React.useMemo(
    () => ({
      ...paginationState,
      filter: getFilterVariables(params)
    }),
    [params]
  );

  return (
    <ServiceListQuery displayLoader variables={queryVariables}>
      {({ data, loading }) => (
        <TypedServiceMemberAddMutation
          onCompleted={handleServiceMemberAddSuccess}
        >
          {(addServiceMember, addServiceMemberData) => {
            const handleServiceMemberAdd = (variables: AddServiceMemberForm) =>
              addServiceMember({
                variables: {
                  input: {
                    email: variables.email,
                    firstName: variables.firstName,
                    lastName: variables.lastName,
                    permissions: variables.fullAccess
                      ? maybe(() => shop.permissions.map(perm => perm.code))
                      : undefined,
                    sendPasswordEmail: true
                  }
                }
              });
            const addTransitionState = getMutationState(
              addServiceMemberData.called,
              addServiceMemberData.loading,
              maybe(() => addServiceMemberData.data.serviceCreate.errors)
            );

            const { loadNextPage, loadPreviousPage, pageInfo } = paginate(
              maybe(() => data.serviceUsers.pageInfo),
              paginationState,
              params
            );

            return (
              <>
                <ServiceListPage
                  currentTab={currentTab}
                  initialSearch={params.query || ""}
                  onSearchChange={query => changeFilterField({ query })}
                  onAll={() => navigate(serviceListUrl())}
                  onTabChange={handleTabChange}
                  onTabDelete={() => openModal("delete-search")}
                  onTabSave={() => openModal("save-search")}
                  tabs={tabs.map(tab => tab.name)}
                  disabled={loading || addServiceMemberData.loading}
                  settings={settings}
                  pageInfo={pageInfo}
                  serviceMembers={maybe(() =>
                    data.serviceUsers.edges.map(edge => edge.node)
                  )}
                  onAdd={() =>
                    navigate(
                      serviceListUrl({
                        action: "add"
                      })
                    )
                  }
                  onBack={() => navigate(configurationMenuUrl)}
                  onNextPage={loadNextPage}
                  onPreviousPage={loadPreviousPage}
                  onUpdateListSettings={updateListSettings}
                  onRowClick={id => () => navigate(serviceUrl(id))}
                />
              </>
            );
          }}
        </TypedServiceMemberAddMutation>
      )}
    </ServiceListQuery>
  );
};

export default ServiceList;
