import { useMemo } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import type { IconName } from 'mrcamel-ui';
import styled from '@emotion/styled';

import type { ProductLegit } from '@dto/productLegit';
import type { Product } from '@dto/product';

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
  product: Product | undefined;
}) {
  const router = useRouter();
  const {
    theme: {
      palette: { common, secondary, primary }
    }
  } = useTheme();

  const setLegitBottomSheet = useSetRecoilState(productLegitToggleBottomSheetState);

  const { backgroundColor, iconName, description } = useMemo(() => {
    if (data?.status === 10 || data?.status === 12 || data?.status === 13 || data?.status === 20) {
      return {
        backgroundColor: common.ui60,
        iconName: 'LegitFilled',
        description: '이 모델을 잘 아는 전문가들이 사진감정중입니다'
      };
    }

    if (data?.status === 11 || (data?.status === 30 && data?.result === 3)) {
      return {
        backgroundColor: common.ui60,
        iconName: 'OpinionImpossibleOutlined',
        description: '이 매물의 현재 사진들로는 사진감정이 불가해요'
      };
    }

    if (data?.status === 30 && data?.result === 1) {
      return {
        backgroundColor: primary.dark,
        iconName: 'OpinionAuthenticOutlined',
        description: '정품의견이 우세한 매물입니다'
      };
    }

    if (data?.status === 30 && data?.result === 2) {
      return {
        backgroundColor: secondary.red.dark,
        iconName: 'OpinionFakeOutlined',
        description: '가품의심 의견이 있는 매물입니다'
      };
    }

    return {
      backgroundColor: '',
      iconName: '',
      description: ''
    };
  }, [common.ui60, data?.result, data?.status, primary.dark, secondary.red.dark]);

  const handleClickBanner = () => {
    if (product)
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
      router.push(`/legit/${router.query.id}/result`);
      return;
    }

    router.push(`/legit/${router.query.id}`);
  };

  return (
    <Box customStyle={{ width: '100%', height: 53 }}>
      <Banner
        alignment="center"
        gap={10}
        backgroundColor={backgroundColor}
        onClick={handleClickBanner}
      >
        <Flexbox gap={2} alignment="center">
          {iconName.length > 0 && (
            <Icon
              name={iconName as IconName}
              customStyle={{ color: common.cmnW, width: 16, height: 16 }}
            />
          )}
          {description.length > 0 && (
            <Typography variant="body2" weight="medium" customStyle={{ color: common.cmnW }}>
              {description}
            </Typography>
          )}
        </Flexbox>
      </Banner>
    </Box>
  );
}

const Banner = styled(Flexbox)<{ backgroundColor: string }>`
  background: ${({ backgroundColor }) => backgroundColor};
  width: 100%;
  height: 32px;
  padding: 0 20px;
  display: flex;
  justify-content: center;
`;

export default ProductDetailLegitImageBottomBanner;
