import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Hidden from "@material-ui/core/Hidden";
import { makeStyles } from "@material-ui/core/styles";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import React from "react";
import { FormattedMessage, useIntl, IntlShape } from "react-intl";

import CardTitle from "@saleor/components/CardTitle";
import Checkbox from "@saleor/components/Checkbox";
import Money from "@saleor/components/Money";
import ResponsiveTable from "@saleor/components/ResponsiveTable";
import Skeleton from "@saleor/components/Skeleton";
import TableHead from "@saleor/components/TableHead";
import { SingleAutocompleteChoiceType } from "@saleor/components/SingleAutocompleteSelectField";
import LinkChoice from "@saleor/components/LinkChoice";
import { maybe, renderCollection } from "../../../misc";
import { ListActions } from "../../../types";
import {
  ProductDetails_product_variants,
  ProductDetails_product_variants_stock_warehouse
} from "../../types/ProductDetails";
import { ProductVariant_costPrice } from "../../types/ProductVariant";

function getWarehouseChoices(
  variants: ProductDetails_product_variants[],
  intl: IntlShape
): SingleAutocompleteChoiceType[] {
  return [
    {
      label: intl.formatMessage({
        defaultMessage: "All Warehouses",
        description: "filtering option"
      }),
      value: null
    },
    ...variants
      .reduce<ProductDetails_product_variants_stock_warehouse[]>(
        (warehouses, variant) => [
          ...warehouses,
          ...variant.stock.reduce<
            ProductDetails_product_variants_stock_warehouse[]
          >((variantStocks, stock) => {
            if (!!warehouses.find(w => w.id === stock.warehouse.id)) {
              return variantStocks;
            }

            return [...variantStocks, stock.warehouse];
          }, [])
        ],
        []
      )
      .map(w => ({
        label: w.name,
        value: w.id
      }))
  ];
}

const useStyles = makeStyles(
  theme => ({
    [theme.breakpoints.up("lg")]: {
      colInventory: {
        width: 300
      },
      colName: {},
      colPrice: {
        width: 150
      },
      colSku: {
        width: 200
      }
    },
    colInventory: {
      textAlign: "right"
    },
    colName: {},
    colPrice: {
      textAlign: "right"
    },
    colSku: {},
    colStatus: {},
    denseTable: {
      "& td, & th": {
        paddingRight: theme.spacing(3)
      }
    },
    link: {
      cursor: "pointer"
    },
    select: {
      display: "inline-block"
    },
    textLeft: {
      textAlign: "left" as "left"
    },
    textRight: {
      textAlign: "right" as "right"
    },
    warehouseLabel: {
      display: "inline-block",
      marginRight: theme.spacing()
    },
    warehouseSelectContainer: {
      paddingTop: theme.spacing(2)
    }
  }),
  { name: "ProductVariants" }
);

interface ProductVariantsProps extends ListActions {
  disabled: boolean;
  variants: ProductDetails_product_variants[];
  fallbackPrice?: ProductVariant_costPrice;
  onRowClick: (id: string) => () => void;
  onVariantAdd?();
  onVariantsAdd?();
}

const numberOfColumns = 5;

export const ProductVariants: React.FC<ProductVariantsProps> = props => {
  const {
    disabled,
    variants,
    fallbackPrice,
    onRowClick,
    onVariantAdd,
    onVariantsAdd,
    isChecked,
    selected,
    toggle,
    toggleAll,
    toolbar
  } = props;
  const classes = useStyles(props);

  const intl = useIntl();
  const [warehouse, setWarehouse] = React.useState(null);
  const hasVariants = maybe(() => variants.length > 0, true);

  return (
    <Card>
      <CardTitle
        title={intl.formatMessage({
          defaultMessage: "Variants",
          description: "section header"
        })}
        toolbar={
          hasVariants ? (
            <Button
              onClick={onVariantAdd}
              variant="text"
              color="primary"
              data-tc="button-add-variant"
            >
              <FormattedMessage
                defaultMessage="Create variant"
                description="button"
              />
            </Button>
          ) : (
            <Button
              onClick={onVariantsAdd}
              variant="text"
              color="primary"
              data-tc="button-add-variants"
            >
              <FormattedMessage
                defaultMessage="Create variants"
                description="button"
              />
            </Button>
          )
        }
      />

      {variants.length > 0 ? (
        <CardContent className={classes.warehouseSelectContainer}>
          <Typography className={classes.warehouseLabel}>
            <FormattedMessage
              defaultMessage="Available inventoty at:"
              description="variant stock status"
            />
          </Typography>
          <LinkChoice
            className={classes.select}
            choices={getWarehouseChoices(variants, intl)}
            name="warehouse"
            value={warehouse}
            onChange={event => setWarehouse(event.target.value)}
          />
        </CardContent>
      ) : (
        <CardContent>
          <Typography color={hasVariants ? "textPrimary" : "textSecondary"}>
            <FormattedMessage defaultMessage="Use variants for products that come in a variety of versions for example different sizes or colors" />
          </Typography>
        </CardContent>
      )}
      {hasVariants && (
        <ResponsiveTable className={classes.denseTable}>
          <TableHead
            colSpan={numberOfColumns}
            selected={selected}
            disabled={disabled}
            items={variants}
            toggleAll={toggleAll}
            toolbar={toolbar}
          >
            <TableCell className={classes.colName}>
              <FormattedMessage
                defaultMessage="Variant"
                description="product variant name"
              />
            </TableCell>
            <TableCell className={classes.colSku}>
              <FormattedMessage defaultMessage="SKU" />
            </TableCell>
            <Hidden smDown>
              <TableCell className={classes.colPrice}>
                <FormattedMessage
                  defaultMessage="Price"
                  description="product variant price"
                />
              </TableCell>
            </Hidden>
            <TableCell className={classes.colInventory}>
              <FormattedMessage
                defaultMessage="Inventory"
                description="product variant inventory status"
              />
            </TableCell>
          </TableHead>
          <TableBody>
            {renderCollection(variants, variant => {
              const isSelected = variant ? isChecked(variant.id) : false;
              const numAvailable =
                variant && variant.stock
                  ? variant.stock.reduce((acc, s) => acc + s.quantity, 0)
                  : null;
              const variantStock = variant.stock.find(
                s => s.warehouse.id === warehouse
              );

              return (
                <TableRow
                  selected={isSelected}
                  hover={!!variant}
                  onClick={onRowClick(variant.id)}
                  key={variant ? variant.id : "skeleton"}
                  className={classes.link}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      disabled={disabled}
                      disableClickPropagation
                      onChange={() => toggle(variant.id)}
                    />
                  </TableCell>
                  <TableCell className={classes.colName} data-tc="name">
                    {variant ? variant.name || variant.sku : <Skeleton />}
                  </TableCell>
                  <TableCell className={classes.colSku} data-tc="sku">
                    {variant ? variant.sku : <Skeleton />}
                  </TableCell>
                  <Hidden smDown>
                    <TableCell className={classes.colPrice} data-tc="price">
                      {variant ? (
                        variant.priceOverride ? (
                          <Money money={variant.priceOverride} />
                        ) : fallbackPrice ? (
                          <Money money={fallbackPrice} />
                        ) : (
                          <Skeleton />
                        )
                      ) : (
                        <Skeleton />
                      )}
                    </TableCell>
                  </Hidden>
                  <TableCell
                    className={classes.colInventory}
                    data-tc="inventory"
                  >
                    {numAvailable === null ? (
                      <Skeleton />
                    ) : warehouse === null ? (
                      numAvailable === 0 ? (
                        <FormattedMessage
                          defaultMessage="Unavailable in all locations"
                          description="product variant inventory"
                        />
                      ) : (
                        <FormattedMessage
                          defaultMessage="{numAvailable} available at {numLocations} {numLocations,plural,one{location} other{locations}}"
                          description="product variant inventory"
                          values={{
                            numAvailable,
                            numLocations: variant.stock.length
                          }}
                        />
                      )
                    ) : !!variantStock ? (
                      variantStock.quantity > 0 ? (
                        <FormattedMessage
                          defaultMessage="{stockQuantity} available"
                          description="product variant inventory"
                          values={{
                            stockQuantity: variantStock.quantity
                          }}
                        />
                      ) : (
                        <FormattedMessage
                          defaultMessage="Unavailable"
                          description="product variant inventory"
                        />
                      )
                    ) : (
                      <FormattedMessage
                        defaultMessage="Not stocked"
                        description="product variant inventory"
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </ResponsiveTable>
      )}
    </Card>
  );
};
ProductVariants.displayName = "ProductVariants";
export default ProductVariants;
