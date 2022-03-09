import { DialogContentText } from "@material-ui/core";
import {
  ChannelVoucherData,
  createChannelsDataWithDiscountPrice,
  createSortedChannelsDataFromVoucher
} from "@saleor/channels/utils";
import ActionDialog from "@saleor/components/ActionDialog";
import useAppChannel from "@saleor/components/AppLayout/AppChannelContext";
import AssignCategoriesDialog from "@saleor/components/AssignCategoryDialog";
import AssignCollectionDialog from "@saleor/components/AssignCollectionDialog";
import AssignProductDialog from "@saleor/components/AssignProductDialog";
import ChannelsAvailabilityDialog from "@saleor/components/ChannelsAvailabilityDialog";
import { WindowTitle } from "@saleor/components/WindowTitle";
import { DEFAULT_INITIAL_SEARCH_DATA, PAGINATE_BY } from "@saleor/config";
import DiscountCountrySelectDialog from "@saleor/discounts/components/DiscountCountrySelectDialog";
import VoucherDetailsPage, {
  VoucherDetailsPageTab
} from "@saleor/discounts/components/VoucherDetailsPage";
import {
  voucherListUrl,
  voucherUrl,
  VoucherUrlDialog,
  VoucherUrlQueryParams
} from "@saleor/discounts/urls";
import {
  useUpdateMetadataMutation,
  useUpdatePrivateMetadataMutation,
  useVoucherCataloguesAddMutation,
  useVoucherCataloguesRemoveMutation,
  useVoucherChannelListingUpdateMutation,
  useVoucherDeleteMutation,
  useVoucherDetailsQuery,
  useVoucherUpdateMutation
} from "@saleor/graphql";
import useBulkActions from "@saleor/hooks/useBulkActions";
import useChannels from "@saleor/hooks/useChannels";
import useLocalPaginator, {
  useSectionLocalPaginationState
} from "@saleor/hooks/useLocalPaginator";
import useNavigator from "@saleor/hooks/useNavigator";
import useNotifier from "@saleor/hooks/useNotifier";
import useShop from "@saleor/hooks/useShop";
import { commonMessages, sectionNames } from "@saleor/intl";
import { Button } from "@saleor/macaw-ui";
import useCategorySearch from "@saleor/searches/useCategorySearch";
import useCollectionSearch from "@saleor/searches/useCollectionSearch";
import useProductSearch from "@saleor/searches/useProductSearch";
import { arrayDiff } from "@saleor/utils/arrays";
import createDialogActionHandlers from "@saleor/utils/handlers/dialogActionHandlers";
import createMetadataUpdateHandler from "@saleor/utils/handlers/metadataUpdateHandler";
import { mapEdgesToItems } from "@saleor/utils/maps";
import React, { useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { categoryUrl } from "../../../categories/urls";
import { collectionUrl } from "../../../collections/urls";
import { maybe } from "../../../misc";
import { productUrl } from "../../../products/urls";
import { createUpdateHandler } from "./handlers";
import { VOUCHER_UPDATE_FORM_ID } from "./types";

interface VoucherDetailsProps {
  id: string;
  params: VoucherUrlQueryParams;
}

export const VoucherDetails: React.FC<VoucherDetailsProps> = ({
  id,
  params
}) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  const shop = useShop();
  const { isSelected, listElements, reset, toggle, toggleAll } = useBulkActions(
    params.ids
  );
  const intl = useIntl();
  const {
    loadMore: loadMoreCategories,
    search: searchCategories,
    result: searchCategoriesOpts
  } = useCategorySearch({
    variables: DEFAULT_INITIAL_SEARCH_DATA
  });
  const {
    loadMore: loadMoreCollections,
    search: searchCollections,
    result: searchCollectionsOpts
  } = useCollectionSearch({
    variables: DEFAULT_INITIAL_SEARCH_DATA
  });
  const {
    loadMore: loadMoreProducts,
    search: searchProducts,
    result: searchProductsOpts
  } = useProductSearch({
    variables: DEFAULT_INITIAL_SEARCH_DATA
  });
  const [updateMetadata] = useUpdateMetadataMutation({});
  const [updatePrivateMetadata] = useUpdatePrivateMetadataMutation({});

  const [activeTab, setActiveTab] = useState<VoucherDetailsPageTab>(
    VoucherDetailsPageTab.categories
  );
  const [paginationState, setPaginationState] = useSectionLocalPaginationState(
    PAGINATE_BY,
    activeTab
  );
  const paginate = useLocalPaginator(setPaginationState);
  const changeTab = (tab: VoucherDetailsPageTab) => {
    reset();
    setActiveTab(tab);
  };

  const { data, loading } = useVoucherDetailsQuery({
    displayLoader: true,
    variables: {
      id,
      ...paginationState
    }
  });

  const [openModal, closeModal] = createDialogActionHandlers<
    VoucherUrlDialog,
    VoucherUrlQueryParams
  >(navigate, params => voucherUrl(id, params), params);

  const { channel, availableChannels } = useAppChannel(false);

  const allChannels: ChannelVoucherData[] = createChannelsDataWithDiscountPrice(
    data?.voucher,
    availableChannels
  );
  const voucherChannelsChoices: ChannelVoucherData[] = useMemo(
    () => createSortedChannelsDataFromVoucher(data?.voucher),
    [data?.voucher]
  );

  const {
    channelListElements,
    channelsToggle,
    currentChannels,
    handleChannelsConfirm,
    handleChannelsModalClose,
    handleChannelsModalOpen,
    isChannelSelected,
    isChannelsModalOpen,
    setCurrentChannels,
    toggleAllChannels
  } = useChannels(
    voucherChannelsChoices,
    params?.action,
    {
      closeModal,
      openModal
    },
    { formId: VOUCHER_UPDATE_FORM_ID }
  );

  const [
    updateChannels,
    updateChannelsOpts
  ] = useVoucherChannelListingUpdateMutation({});

  const [voucherUpdate, voucherUpdateOpts] = useVoucherUpdateMutation({
    onCompleted: data => {
      if (data.voucherUpdate.errors.length === 0) {
        closeModal();
        notify({
          status: "success",
          text: intl.formatMessage(commonMessages.savedChanges)
        });
      }
    }
  });

  const [voucherDelete, voucherDeleteOpts] = useVoucherDeleteMutation({
    onCompleted: data => {
      if (data.voucherDelete.errors.length === 0) {
        notify({
          status: "success",
          text: intl.formatMessage({
            defaultMessage: "Deleted voucher"
          })
        });
        navigate(voucherListUrl(), { replace: true });
      }
    }
  });

  const [
    voucherCataloguesRemove,
    voucherCataloguesRemoveOpts
  ] = useVoucherCataloguesRemoveMutation({
    onCompleted: data => {
      if (data.voucherCataloguesRemove.errors.length === 0) {
        closeModal();
        reset();
      }
    }
  });

  const [
    voucherCataloguesAdd,
    voucherCataloguesAddOpts
  ] = useVoucherCataloguesAddMutation({
    onCompleted: data => {
      if (data.voucherCataloguesAdd.errors.length === 0) {
        closeModal();
      }
    }
  });

  const canOpenBulkActionDialog = maybe(() => params.ids.length > 0);

  const hasArrChanged = () => {
    const { added, removed } = arrayDiff(
      voucherChannelsChoices.map(choice => choice.id),
      currentChannels.map(choice => choice.id)
    );

    return added.length !== 0 || removed.length !== 0;
  };

  const handleUpdate = createUpdateHandler(
    data?.voucher,
    voucherChannelsChoices,
    variables => voucherUpdate({ variables }),
    updateChannels
  );

  const handleSubmit = createMetadataUpdateHandler(
    data?.voucher,
    handleUpdate,
    variables => updateMetadata({ variables }),
    variables => updatePrivateMetadata({ variables })
  );

  const tabPageInfo =
    activeTab === VoucherDetailsPageTab.categories
      ? maybe(() => data.voucher.categories.pageInfo)
      : activeTab === VoucherDetailsPageTab.collections
      ? maybe(() => data.voucher.collections.pageInfo)
      : maybe(() => data.voucher.products.pageInfo);

  const handleCategoriesUnassign = (ids: string[]) =>
    voucherCataloguesRemove({
      variables: {
        ...paginationState,
        id,
        input: {
          categories: ids
        }
      }
    });

  const handleCollectionsUnassign = (ids: string[]) =>
    voucherCataloguesRemove({
      variables: {
        ...paginationState,
        id,
        input: {
          collections: ids
        }
      }
    });

  const handleProductsUnassign = (ids: string[]) =>
    voucherCataloguesRemove({
      variables: {
        ...paginationState,
        id,
        input: {
          products: ids
        }
      }
    });

  const { loadNextPage, loadPreviousPage, pageInfo } = paginate(
    tabPageInfo,
    paginationState
  );

  return (
    <>
      <WindowTitle title={intl.formatMessage(sectionNames.vouchers)} />
      {!!allChannels?.length && (
        <ChannelsAvailabilityDialog
          isSelected={isChannelSelected}
          disabled={false}
          channels={allChannels}
          onChange={channelsToggle}
          onClose={handleChannelsModalClose}
          open={isChannelsModalOpen}
          title={intl.formatMessage({
            defaultMessage: "Manage Channel Availability"
          })}
          selected={channelListElements.length}
          confirmButtonState="default"
          onConfirm={handleChannelsConfirm}
          toggleAll={toggleAllChannels}
        />
      )}
      <VoucherDetailsPage
        voucher={data?.voucher}
        allChannelsCount={allChannels?.length}
        channelListings={currentChannels}
        hasChannelChanged={hasArrChanged()}
        disabled={
          loading ||
          voucherCataloguesRemoveOpts.loading ||
          updateChannelsOpts.loading
        }
        errors={[
          ...(voucherUpdateOpts.data?.voucherUpdate.errors || []),
          ...(updateChannelsOpts.data?.voucherChannelListingUpdate.errors || [])
        ]}
        selectedChannelId={channel?.id}
        pageInfo={pageInfo}
        onNextPage={loadNextPage}
        onPreviousPage={loadPreviousPage}
        onCategoryAssign={() => openModal("assign-category")}
        onCategoryClick={id => () => navigate(categoryUrl(id))}
        onCollectionAssign={() => openModal("assign-collection")}
        onCollectionUnassign={collectionId =>
          voucherCataloguesRemove({
            variables: {
              ...paginationState,
              id,
              input: {
                collections: [collectionId]
              }
            }
          })
        }
        onCountryAssign={() => openModal("assign-country")}
        onCountryUnassign={countryCode =>
          voucherUpdate({
            variables: {
              ...paginationState,
              id,
              input: {
                countries: data.voucher.countries
                  .filter(country => country.code !== countryCode)
                  .map(country => country.code)
              }
            }
          })
        }
        onCategoryUnassign={categoryId =>
          voucherCataloguesRemove({
            variables: {
              ...paginationState,
              id,
              input: {
                categories: [categoryId]
              }
            }
          })
        }
        onCollectionClick={id => () => navigate(collectionUrl(id))}
        onProductAssign={() => openModal("assign-product")}
        onProductUnassign={productId =>
          voucherCataloguesRemove({
            variables: {
              ...paginationState,
              id,
              input: {
                products: [productId]
              }
            }
          })
        }
        onProductClick={id => () => navigate(productUrl(id))}
        activeTab={activeTab}
        onBack={() => navigate(voucherListUrl())}
        onTabClick={changeTab}
        onSubmit={handleSubmit}
        onRemove={() => openModal("remove")}
        openChannelsModal={handleChannelsModalOpen}
        onChannelsChange={setCurrentChannels}
        saveButtonBarState={voucherUpdateOpts.status}
        categoryListToolbar={
          <Button
            onClick={() =>
              openModal("unassign-category", {
                ids: listElements
              })
            }
          >
            <FormattedMessage
              defaultMessage="Unassign"
              description="unassign category from voucher, button"
              id="voucherDetailsUnassignCategory"
            />
          </Button>
        }
        collectionListToolbar={
          <Button
            onClick={() =>
              openModal("unassign-collection", {
                ids: listElements
              })
            }
          >
            <FormattedMessage
              defaultMessage="Unassign"
              description="unassign collection from voucher, button"
              id="voucherDetailsUnassignCollection"
            />
          </Button>
        }
        productListToolbar={
          <Button
            onClick={() =>
              openModal("unassign-product", {
                ids: listElements
              })
            }
          >
            <FormattedMessage
              defaultMessage="Unassign"
              description="unassign product from voucher, button"
              id="voucherDetailsUnassignProduct"
            />
          </Button>
        }
        isChecked={isSelected}
        selected={listElements.length}
        toggle={toggle}
        toggleAll={toggleAll}
      />
      <AssignCategoriesDialog
        categories={mapEdgesToItems(searchCategoriesOpts?.data?.search)?.filter(
          suggestedCategory => suggestedCategory.id
        )}
        confirmButtonState={voucherCataloguesAddOpts.status}
        hasMore={searchCategoriesOpts.data?.search.pageInfo.hasNextPage}
        open={params.action === "assign-category"}
        onFetch={searchCategories}
        onFetchMore={loadMoreCategories}
        loading={searchCategoriesOpts.loading}
        onClose={closeModal}
        onSubmit={categories =>
          voucherCataloguesAdd({
            variables: {
              ...paginationState,
              id,
              input: {
                categories
              }
            }
          })
        }
      />
      <AssignCollectionDialog
        collections={mapEdgesToItems(
          searchCollectionsOpts?.data?.search
        )?.filter(suggestedCategory => suggestedCategory.id)}
        confirmButtonState={voucherCataloguesAddOpts.status}
        hasMore={searchCollectionsOpts.data?.search.pageInfo.hasNextPage}
        open={params.action === "assign-collection"}
        onFetch={searchCollections}
        onFetchMore={loadMoreCollections}
        loading={searchCollectionsOpts.loading}
        onClose={closeModal}
        onSubmit={collections =>
          voucherCataloguesAdd({
            variables: {
              ...paginationState,
              id,
              input: {
                collections
              }
            }
          })
        }
      />
      <DiscountCountrySelectDialog
        confirmButtonState={voucherUpdateOpts.status}
        countries={maybe(() => shop.countries, [])}
        onClose={() => navigate(voucherUrl(id))}
        onConfirm={formData =>
          voucherUpdate({
            variables: {
              id,
              input: {
                countries: formData.countries
              }
            }
          })
        }
        open={params.action === "assign-country"}
        initial={maybe(
          () => data.voucher.countries.map(country => country.code),
          []
        )}
      />
      <AssignProductDialog
        confirmButtonState={voucherCataloguesAddOpts.status}
        hasMore={searchProductsOpts.data?.search.pageInfo.hasNextPage}
        open={params.action === "assign-product"}
        onFetch={searchProducts}
        onFetchMore={loadMoreProducts}
        loading={searchProductsOpts.loading}
        onClose={closeModal}
        onSubmit={products =>
          voucherCataloguesAdd({
            variables: {
              ...paginationState,
              id,
              input: {
                products
              }
            }
          })
        }
        products={mapEdgesToItems(searchProductsOpts?.data?.search)?.filter(
          suggestedProduct => suggestedProduct.id
        )}
      />
      <ActionDialog
        open={params.action === "unassign-category" && canOpenBulkActionDialog}
        title={intl.formatMessage({
          defaultMessage: "Unassign Categories From Voucher",
          description: "dialog header"
        })}
        confirmButtonState={voucherCataloguesRemoveOpts.status}
        onClose={closeModal}
        onConfirm={() => handleCategoriesUnassign(params.ids)}
      >
        {canOpenBulkActionDialog && (
          <DialogContentText>
            <FormattedMessage
              defaultMessage="{counter,plural,one{Are you sure you want to unassign this category?} other{Are you sure you want to unassign {displayQuantity} categories?}}"
              description="dialog content"
              values={{
                counter: params.ids.length,
                displayQuantity: <strong>{params.ids.length}</strong>
              }}
            />
          </DialogContentText>
        )}
      </ActionDialog>
      <ActionDialog
        open={
          params.action === "unassign-collection" && canOpenBulkActionDialog
        }
        title={intl.formatMessage({
          defaultMessage: "Unassign Collections From Voucher",
          description: "dialog header"
        })}
        confirmButtonState={voucherCataloguesRemoveOpts.status}
        onClose={closeModal}
        onConfirm={() => handleCollectionsUnassign(params.ids)}
      >
        {canOpenBulkActionDialog && (
          <DialogContentText>
            <FormattedMessage
              defaultMessage="{counter,plural,one{Are you sure you want to unassign this collection?} other{Are you sure you want to unassign {displayQuantity} collections?}}"
              description="dialog content"
              values={{
                counter: params.ids.length,
                displayQuantity: <strong>{params.ids.length}</strong>
              }}
            />
          </DialogContentText>
        )}
      </ActionDialog>
      <ActionDialog
        open={params.action === "unassign-product" && canOpenBulkActionDialog}
        title={intl.formatMessage({
          defaultMessage: "Unassign Products From Voucher",
          description: "dialog header"
        })}
        confirmButtonState={voucherCataloguesRemoveOpts.status}
        onClose={closeModal}
        onConfirm={() => handleProductsUnassign(params.ids)}
      >
        {canOpenBulkActionDialog && (
          <DialogContentText>
            <FormattedMessage
              defaultMessage="{counter,plural,one{Are you sure you want to unassign this product?} other{Are you sure you want to unassign {displayQuantity} products?}}"
              description="dialog content"
              values={{
                counter: params.ids.length,
                displayQuantity: <strong>{params.ids.length}</strong>
              }}
            />
          </DialogContentText>
        )}
      </ActionDialog>
      <ActionDialog
        open={params.action === "remove"}
        title={intl.formatMessage({
          defaultMessage: "Delete Voucher",
          description: "dialog header"
        })}
        confirmButtonState={voucherDeleteOpts.status}
        onClose={closeModal}
        variant="delete"
        onConfirm={() =>
          voucherDelete({
            variables: { id }
          })
        }
      >
        <DialogContentText>
          <FormattedMessage
            defaultMessage="Are you sure you want to delete {voucherCode}?"
            description="dialog content"
            values={{
              voucherCode: (
                <strong>{maybe(() => data.voucher.code, "...")}</strong>
              )
            }}
          />
        </DialogContentText>
      </ActionDialog>
    </>
  );
};
export default VoucherDetails;
