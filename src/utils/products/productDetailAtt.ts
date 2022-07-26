import type { Product } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';

interface ProductDetailAttProps {
  key: string;
  product: Product;
  rest?: object;
  source?: string;
}

const productDetailAtt = ({ key, product, rest, source }: ProductDetailAttProps) => {
  logEvent(key, {
    name: attrProperty.productName.PRODUCT_DETAIL,
    ...rest,
    id: product.id,
    site: product.site.name,
    brand: product.brand.name,
    category: product.category.name,
    parentId: product.category.parentId,
    parentCategory: FIRST_CATEGORIES[product.category.parentId as number],
    line: product.line,
    price: product.price,
    scoreTotal: product.scoreTotal,
    scoreStatus: product.scoreStatus,
    scoreSeller: product.scoreSeller,
    scorePrice: product.scorePrice,
    scorePriceAvg: product.scorePriceAvg,
    scorePriceCount: product.scorePriceCount,
    scorePriceRate: product.scorePriceRate,
    source: source || attrProperty.productSource.MAIN_CAMEL,
    imageCount: product.imageCount
  });
};

export default productDetailAtt;
