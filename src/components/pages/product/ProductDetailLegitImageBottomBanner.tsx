import { useMemo } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';
import type { IconName } from '@mrcamelhub/camel-ui';
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
      palette: { secondary, primary, common }
    }
  } = useTheme();

  const setLegitBottomSheet = useSetRecoilState(productLegitToggleBottomSheetState);

  const { color, iconName, description } = useMemo(() => {
    if (data?.status === 10 || data?.status === 12 || data?.status === 13 || data?.status === 20) {
      return {
        color: '',
        iconName: '',
        description: ''
      };
    }

    if (data?.status === 11 || (data?.status === 30 && data?.result === 3)) {
      return {
        color: '',
        iconName: '',
        description: ''
      };
    }

    if (data?.status === 30 && data?.result === 1) {
      return {
        color: primary.light,
        iconName: 'OpinionAuthenticOutlined',
        description: '전문가들의 사진감정결과, <span>정품의견</span>이 우세해요!'
      };
    }

    if (data?.status === 30 && data?.result === 2) {
      return {
        color: secondary.red.light,
        iconName: 'OpinionFakeOutlined',
        description: '전문가들의 사진감정결과, <span>의심의견</span>이 있어요.'
      };
    }

    if (!data?.status) {
      return {
        color: common.ui20,
        iconName: 'LegitFilled',
        description: '지금 보는 사진 그대로 정가품 의견 받아보기'
      };
    }

    return {
      color: '',
      iconName: '',
      description: ''
    };
  }, [common.ui20, data?.result, data?.status, primary.light, secondary.red.light]);

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

  if (!iconName.length) return null;

  return (
    <Box customStyle={{ width: '100%', height: 53 }}>
      <Banner alignment="center" gap={10} onClick={handleClickBanner}>
        <Flexbox gap={4} alignment="center">
          {iconName.length > 0 && (
            <Icon name={iconName as IconName} width={20} height={20} color={color} />
          )}
          {description.length > 0 && (
            <Typography
              dangerouslySetInnerHTML={{ __html: description }}
              customStyle={{
                '& span': {
                  color,
                  fontWeight: 700
                }
              }}
            />
          )}
        </Flexbox>
        <Icon name="Arrow2RightOutlined" width={16} height={16} />
      </Banner>
    </Box>
  );
}

const Banner = styled(Flexbox)`
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 44px;
  padding: 0 20px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.line02};
`;

export default ProductDetailLegitImageBottomBanner;
