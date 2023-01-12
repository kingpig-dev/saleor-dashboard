import { useApolloClient } from "@apollo/client";
import AppDeleteDialog from "@saleor/apps/components/AppDeleteDialog";
import { appMessages } from "@saleor/apps/messages";
import { EXTENSION_LIST_QUERY } from "@saleor/apps/queries";
import NotFoundPage from "@saleor/components/NotFoundPage";
import {
  useAppActivateMutation,
  useAppDeactivateMutation,
  useAppDeleteMutation,
  useAppQuery,
} from "@saleor/graphql";
import useNavigator from "@saleor/hooks/useNavigator";
import useNotifier from "@saleor/hooks/useNotifier";
import getAppErrorMessage from "@saleor/utils/errors/app";
import createDialogActionHandlers from "@saleor/utils/handlers/dialogActionHandlers";
import React from "react";
import { useIntl } from "react-intl";

import AppActivateDialog from "../../components/AppActivateDialog";
import AppDeactivateDialog from "../../components/AppDeactivateDialog";
import AppDetailsPage from "../../components/AppDetailsPage";
import {
  appDetailsUrl,
  AppDetailsUrlDialog,
  AppDetailsUrlQueryParams,
  appsListPath,
  appUrl,
} from "../../urls";
import { messages } from "./messages";

interface AppDetailsProps {
  id: string;
  params: AppDetailsUrlQueryParams;
}

export const AppDetails: React.FC<AppDetailsProps> = ({ id, params }) => {
  const client = useApolloClient();
  const { data, loading, refetch } = useAppQuery({
    displayLoader: true,
    variables: { id },
  });

  const appExists = data?.app !== null;

  const navigate = useNavigator();
  const notify = useNotifier();
  const intl = useIntl();
  const mutationOpts = { variables: { id } };
  const [activateApp, activateAppResult] = useAppActivateMutation({
    onCompleted: data => {
      const errors = data?.appActivate?.errors;
      if (errors?.length === 0) {
        notify({
          status: "success",
          text: intl.formatMessage(appMessages.appActivated),
        });
        refetch();
        closeModal();
      } else {
        if (appExists && errors) {
          errors.forEach(error =>
            notify({
              status: "error",
              text: getAppErrorMessage(error, intl),
            }),
          );
        }
      }
    },
  });
  const [deactivateApp, deactivateAppResult] = useAppDeactivateMutation({
    onCompleted: data => {
      const errors = data?.appDeactivate?.errors;
      if (errors?.length === 0) {
        notify({
          status: "success",
          text: intl.formatMessage(appMessages.appDeactivated),
        });
        refetch();
        closeModal();
      } else {
        if (appExists && errors) {
          errors.forEach(error =>
            notify({
              status: "error",
              text: getAppErrorMessage(error, intl),
            }),
          );
        }
      }
    },
  });

  const refetchExtensionList = () => {
    client.refetchQueries({
      include: [EXTENSION_LIST_QUERY],
    });
  };

  const removeAppNotify = () => {
    notify({
      status: "success",
      text: intl.formatMessage(messages.appRemoved),
    });
  };

  const [deleteApp, deleteAppOpts] = useAppDeleteMutation({
    onCompleted: data => {
      if (!data?.appDelete?.errors?.length) {
        refetch();
        closeModal();
        refetchExtensionList();
        removeAppNotify();
      }
    },
  });

  const [openModal, closeModal] = createDialogActionHandlers<
    AppDetailsUrlDialog,
    AppDetailsUrlQueryParams
  >(navigate, params => appDetailsUrl(id, params), params);

  const handleActivateConfirm = () => activateApp(mutationOpts);
  const handleDeactivateConfirm = () => deactivateApp(mutationOpts);
  const handleRemoveConfirm = () => deleteApp(mutationOpts);

  if (!appExists) {
    return <NotFoundPage backHref={appsListPath} />;
  }

  return (
    <>
      <AppActivateDialog
        confirmButtonState={activateAppResult.status}
        name={data?.app?.name || ""}
        onClose={closeModal}
        onConfirm={handleActivateConfirm}
        open={params.action === "app-activate"}
      />
      <AppDeactivateDialog
        confirmButtonState={deactivateAppResult.status}
        name={data?.app?.name || ""}
        onClose={closeModal}
        onConfirm={handleDeactivateConfirm}
        open={params.action === "app-deactivate"}
      />
      <AppDeleteDialog
        confirmButtonState={deleteAppOpts.status}
        name={data?.app?.name || ""}
        onClose={closeModal}
        onConfirm={handleRemoveConfirm}
        type="EXTERNAL"
        open={params.action === "app-delete"}
      />
      <AppDetailsPage
        data={data?.app || null}
        loading={loading}
        navigateToApp={() => navigate(appUrl(id))}
        onAppActivateOpen={() => openModal("app-activate")}
        onAppDeactivateOpen={() => openModal("app-deactivate")}
        onAppDeleteOpen={() => openModal("app-delete")}
      />
    </>
  );
};

export default AppDetails;
