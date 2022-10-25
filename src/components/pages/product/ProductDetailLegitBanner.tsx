import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import type { ProductLegit } from '@dto/productLegit';
import type { Product } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { productLegitToggleBottomSheetState } from '@recoil/productLegit';

function ProductDetailLegitBanner({ data, product }: { data: ProductLegit; product: Product }) {
  const router = useRouter();

  const {
    theme: {
      palette: { common, secondary, primary }
    }
  } = useTheme();
  const setLegitBottomSheet = useSetRecoilState(productLegitToggleBottomSheetState);

  const handleClick = () => {
    logEvent(attrKeys.legit.CLICK_LEGIT_BANNER, {
      name: attrProperty.productName.PRODUCT_DETAIL,
      title: attrProperty.productTitle.MIDDLE,
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
      router.push(`/${router.query.id}/result`);
      return;
    }
    router.push(`/legit/${router.query.id}`);
  };

  return (
    <>
      <StyledBanner alignment="center" isDisplay={!data?.status} onClick={handleClick}>
        <Box>
          <Typography>이 모델을 잘 아는 전문가들에게</Typography>
          <Typography weight="bold" variant="h4">
            사진으로 정가품 문의하세요!
          </Typography>
        </Box>
        <Img
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/new_icon/info_fill_basic.png`}
          alt="info_fill_basic"
          width={80}
        />
      </StyledBanner>
      <StyledBanner
        alignment="center"
        bgColor={common.ui95}
        isDisplay={
          data?.status === 10 || data?.status === 12 || data?.status === 13 || data?.status === 20
        }
        onClick={handleClick}
      >
        <Box>
          <Typography>이 모델을 잘 아는 전문가들이</Typography>
          <Typography weight="bold" variant="h4">
            사진감정중입니다.
          </Typography>
        </Box>
        <Img
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/new_icon/info_fill_basic.png`}
          alt="info_fill_basic"
          width={80}
        />
      </StyledBanner>
      <StyledBanner
        alignment="center"
        bgColor={common.ui95}
        isDisplay={data?.status === 11}
        onClick={handleClick}
      >
        <Box>
          <Typography>이 매물의 현재 사진들로는</Typography>
          <Typography weight="bold" variant="h4">
            사진감정이 불가해요
          </Typography>
        </Box>
        <Img
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/new_icon/info_fill_basic.png`}
          alt="info_fill_basic"
          width={80}
        />
      </StyledBanner>
      <StyledBanner
        alignment="center"
        bgColor={primary.bgLight}
        isDisplay={data?.status === 30 && data.result === 1}
        onClick={handleClick}
      >
        <Box>
          <Typography>😎 명품감정 전문가들의 사진감정결과,</Typography>
          <Typography weight="bold" variant="h4">
            정품의견이 우세합니다!
          </Typography>
        </Box>
        <Img
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/new_icon/circle_fill_blue.png`}
          alt="circle_fill_blue"
          width={53}
        />
      </StyledBanner>
      <StyledBanner
        alignment="center"
        bgColor={secondary.red.bgLight}
        isDisplay={data?.status === 30 && data.result === 2}
        onClick={handleClick}
      >
        <Box>
          <Typography>🤔 명품감정 전문가들의 사진감정결과,</Typography>
          <Typography weight="bold" variant="h4">
            의심의견이 있습니다.
          </Typography>
        </Box>
        <Img
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/new_icon/triangle_fill_red.png`}
          alt="triangle_fill_red"
          width={61}
        />
      </StyledBanner>
      <StyledBanner
        alignment="center"
        bgColor={primary.bgLight}
        isDisplay={data?.status === 30 && data.result === 3}
        onClick={handleClick}
      >
        <Box>
          <Typography>명품감정 전문가들의</Typography>
          <Typography weight="bold" variant="h4">
            사진감정의견을 확인해보세요
          </Typography>
        </Box>
        <Img
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/new_icon/info_fill_basic.png`}
          alt="info_fill_basic"
          width={80}
        />
      </StyledBanner>
    </>
  );
}

const StyledBanner = styled(Flexbox)<{ bgColor?: string; isDisplay: boolean }>`
  width: 100%;
  height: 80px;
  border-radius: 8px;
  background: ${({ theme: { palette }, bgColor }) => bgColor || palette.primary.bgLight};
  padding: 16px 20px;
  margin-bottom: 32px;
  display: ${({ isDisplay }) => (isDisplay ? 'flex' : 'none')};
  img {
    display: block;
    margin-left: auto;
  }
`;

const Img = styled.img``;

export default ProductDetailLegitBanner;
