import ProductDetails from "../../apiRequests/storeFront/ProductDetails";
import Search from "../../apiRequests/storeFront/Search";

class StoreFrontProductUtils {
  isProductVisible(productId, channelSlug, name) {
    const productDetails = new ProductDetails();
    return productDetails
      .getProductDetails(productId, channelSlug)
      .then(productDetailsResp => {
        const product = productDetailsResp.body.data.product;
        return product !== null && product.name === name;
      });
  }
  isProductAvailableForPurchase(productId, channelSlug) {
    const productDetails = new ProductDetails();
    return productDetails
      .getProductDetails(productId, channelSlug)
      .then(
        productDetailsResp =>
          productDetailsResp.body.data.product.isAvailableForPurchase
      );
  }
  isProductVisibleInSearchResult(productName, channelSlug) {
    const search = new Search();
    return search
      .searchInShop(productName, channelSlug)
      .then(
        resp =>
          resp.body.data.products.totalCount !== 0 &&
          resp.body.data.products.edges[0].node.name === productName
      );
  }
}
export default StoreFrontProductUtils;
