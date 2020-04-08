import React from "react";

import { ProductDetails_product_productType_variantAttributes } from "@saleor/products/types/ProductDetails";
import { ProductVariantBulkCreate_productVariantBulkCreate_errors } from "@saleor/products/types/ProductVariantBulkCreate";
import { WarehouseFragment } from "@saleor/warehouses/types/WarehouseFragment";
import { isSelected } from "@saleor/utils/lists";
import { ProductVariantCreateFormData } from "./form";
import ProductVariantCreatePriceAndSku from "./ProductVariantCreatorPriceAndSku";
import ProductVariantCreateSummary from "./ProductVariantCreatorSummary";
import ProductVariantCreateValues from "./ProductVariantCreatorValues";
import {
  ProductVariantCreateReducerAction,
  ProductVariantCreateReducerActionType
} from "./reducer";
import { ProductVariantCreatorStep } from "./types";

export interface ProductVariantCreatorContentProps {
  attributes: ProductDetails_product_productType_variantAttributes[];
  currencySymbol: string;
  data: ProductVariantCreateFormData;
  dispatchFormDataAction: React.Dispatch<ProductVariantCreateReducerAction>;
  errors: ProductVariantBulkCreate_productVariantBulkCreate_errors[];
  step: ProductVariantCreatorStep;
  warehouses: WarehouseFragment[];
}

const ProductVariantCreatorContent: React.FC<ProductVariantCreatorContentProps> = props => {
  const {
    attributes,
    currencySymbol,
    data,
    dispatchFormDataAction,
    errors,
    step,
    warehouses
  } = props;
  const selectedAttributes = attributes.filter(attribute =>
    isSelected(
      attribute.id,
      data.attributes.map(dataAttribute => dataAttribute.id),
      (a, b) => a === b
    )
  );

  return (
    <>
      {step === ProductVariantCreatorStep.values && (
        <ProductVariantCreateValues
          attributes={selectedAttributes}
          data={data}
          onValueClick={(attributeId, valueId) =>
            dispatchFormDataAction({
              selectValue: {
                attributeId,
                valueId
              },
              type: ProductVariantCreateReducerActionType.selectValue
            })
          }
        />
      )}
      {step === ProductVariantCreatorStep.prices && (
        <ProductVariantCreatePriceAndSku
          attributes={selectedAttributes}
          currencySymbol={currencySymbol}
          data={data}
          warehouses={warehouses}
          onApplyToAllChange={(mode, type) =>
            dispatchFormDataAction({
              applyPriceOrStockToAll: {
                mode
              },
              type:
                type === "price"
                  ? ProductVariantCreateReducerActionType.applyPriceToAll
                  : ProductVariantCreateReducerActionType.applyStockToAll
            })
          }
          onApplyToAllPriceChange={price =>
            dispatchFormDataAction({
              changeApplyPriceToAllValue: {
                price
              },
              type: ProductVariantCreateReducerActionType.applyPriceToAll
            })
          }
          onApplyToAllStockChange={(warehouseIndex, quantity) =>
            dispatchFormDataAction({
              changeApplyStockToAllValue: {
                quantity: parseInt(quantity, 10),
                warehouseIndex
              },
              type: ProductVariantCreateReducerActionType.applyStockToAll
            })
          }
          onAttributeSelect={(attributeId, type) =>
            dispatchFormDataAction({
              changeApplyPriceOrStockToAttributeId: {
                attributeId
              },
              type:
                type === "price"
                  ? ProductVariantCreateReducerActionType.changeApplyPriceToAttributeId
                  : ProductVariantCreateReducerActionType.changeApplyStockToAttributeId
            })
          }
          onAttributeValueChange={(valueId, price, type) =>
            dispatchFormDataAction(
              type === "price" && {
                changeAttributeValuePrice: {
                  price,
                  valueId
                },
                type:
                  ProductVariantCreateReducerActionType.changeAttributeValuePrice
              }
            )
          }
          onWarehouseToggle={warehouseId =>
            dispatchFormDataAction({
              changeWarehouses: {
                warehouseId
              },
              type: ProductVariantCreateReducerActionType.changeWarehouses
            })
          }
        />
      )}
      {step === ProductVariantCreatorStep.summary && (
        <ProductVariantCreateSummary
          attributes={selectedAttributes}
          currencySymbol={currencySymbol}
          data={data}
          errors={errors}
          onVariantDataChange={(variantIndex, field, value) =>
            dispatchFormDataAction({
              changeVariantData: {
                field,
                value,
                variantIndex
              },
              type: ProductVariantCreateReducerActionType.changeVariantData
            })
          }
          onVariantStockDataChange={(variantIndex, warehouse, value) =>
            dispatchFormDataAction({
              changeVariantStockData: {
                stock: {
                  quantity: parseInt(value, 10),
                  warehouse
                },
                variantIndex
              },
              type: ProductVariantCreateReducerActionType.changeVariantStockData
            })
          }
          onVariantDelete={variantIndex =>
            dispatchFormDataAction({
              deleteVariant: {
                variantIndex
              },
              type: ProductVariantCreateReducerActionType.deleteVariant
            })
          }
          warehouses={warehouses}
        />
      )}
    </>
  );
};

ProductVariantCreatorContent.displayName = "ProductVariantCreatorContent";
export default ProductVariantCreatorContent;
