import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import type { Product, ProductLegit } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { productLegitToggleBottomSheetState } from '@recoil/productLegit';

function ProductDetailLegitImageBottomBanner({
  data,
  product
}: {
  data: ProductLegit | undefined;
  product: Product;
}) {
  const router = useRouter();
  const {
    theme: {
      palette: { common, secondary, primary }
    }
  } = useTheme();
  const setLegitBottomSheet = useSetRecoilState(productLegitToggleBottomSheetState);

  const renderDescription = () => {
    if (data?.status === 10 || data?.status === 20) {
      return (
        <>
          🤓 이 모델을 잘 아는 전문가들이
          <strong style={{ color: primary.light }}> 사진감정중</strong>
          입니다.
        </>
      );
    }
    if (data?.status === 11) {
      return '🤔 이 매물의 현재 사진들로는 사진감정이 불가해요';
    }
    if (data?.status === 30) {
      if (data.result === 1) {
        return (
          <>
            🤓 전문가들의 사진감정결과,
            <strong style={{ color: common.white }}> 정품의견</strong>이 우세합니다!
          </>
        );
      }
      if (data.result === 2) {
        return (
          <>
            🤔 전문가들의 사진감정결과,
            <strong style={{ color: secondary.red.light }}> 의심의견</strong>이 있습니다.
          </>
        );
      }
      if (data.result === 3) {
        return '💬 여러 전문가들의 사진감정결과를 확인해보세요';
      }
    }
    return '';
  };

  return (
    <Box customStyle={{ width: '100%', height: 53 }}>
      <Banner
        alignment="center"
        gap={10}
        original={data?.status === 30 && data.result === 1}
        onClick={() => {
          logEvent(attrKeys.legit.CLICK_LEGIT_BANNER, {
            name: attrProperty.productName.PRODUCT_DETAIL,
            title: attrProperty.productTitle.TOP,
            brand: product.brand.name,
            category: product.category.name,
            parentCategory: FIRST_CATEGORIES[product.category.parentId as number],
            site: product.site.name,
            price: product.price,
            imageCount: product.imageCount,
            legitStatus: data?.status,
            legitResult: data?.result
          });
          if (!data?.status) {
            setLegitBottomSheet(true);
            return;
          }
          if (data.status === 30) {
            router.push(`/products/${router.query.id}/legit/result`);
            return;
          }
          router.push(`/products/${router.query.id}/legit`);
        }}
      >
        {!data?.status && (
          <>
            <Typography weight="medium">🔎</Typography>
            <Typography weight="medium" customStyle={{ color: common.white }}>
              보고있는 이 매물이 정품인지 궁금하다면?
            </Typography>
          </>
        )}
        {data?.status && (
          <Typography weight="medium" customStyle={{ color: common.white }}>
            {renderDescription()}
          </Typography>
        )}
        <Icon
          name="CaretRightOutlined"
          size="small"
          customStyle={{ marginLeft: 'auto', color: common.white }}
        />
      </Banner>
    </Box>
  );
}

const Banner = styled(Flexbox)<{ original: boolean }>`
  background: ${({ theme: { palette }, original }) =>
    original ? palette.primary.main : palette.common.black};
  width: 100%;
  height: 53px;
  padding: 0 20px;
`;

export default ProductDetailLegitImageBottomBanner;
