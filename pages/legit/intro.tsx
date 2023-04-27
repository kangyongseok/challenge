import { useEffect, useMemo } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { Button, Flexbox, Image, Typography, useTheme } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import GeneralTemplate from '@components/templates/GeneralTemplate';

import SessionStorage from '@library/sessionStorage';
import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchProduct } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';
import { getProductDetailUrl } from '@utils/common';

import { legitRequestState } from '@recoil/legitRequest';
import { toastState } from '@recoil/common';

function LegitIntro() {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const setLegitRequestState = useSetRecoilState(legitRequestState);
  const setToastState = useSetRecoilState(toastState);

  const productId = useMemo(() => Number(router.query.productId || ''), [router.query.productId]);

  const { data: { product } = {} } = useQuery(
    queryKeys.products.product({ productId }),
    () => fetchProduct({ productId }),
    {
      enabled: !!productId
    }
  );

  const handleClickRegisterLegit = () => {
    if (!product || !product?.brand?.id || !product?.category?.id) return;

    setLegitRequestState((currVal) => ({
      ...currVal,
      brandId: product.brand.id || 0,
      brandName: product.brand.name,
      brandLogo: `https://${
        process.env.IMAGE_DOMAIN
      }/assets/images/brands/transparent/${product.brand.nameEng
        .toLocaleLowerCase()
        .split(' ')
        .join('')
        .toLowerCase()
        .replace(/\s/g, '')}.png`,
      categoryId: product.category.id || 0,
      categoryName: product.category.name,
      isViewedSampleGuide: true,
      productId
    }));
    router.push('/legit/request/selectModel', undefined, { shallow: true });
  };

  const handleClickCancel = () => {
    if (!product) return;
    const newRegister = !!router.query.register;
    if (newRegister) {
      router.back();
    } else {
      router.replace(getProductDetailUrl({ product })).then(() => {
        setToastState({
          type: 'product',
          status: 'saleSuccess'
        });
      });
    }
  };

  useEffect(() => {
    logEvent(attrKeys.legitIntro.VIEW_LEGIT_RECOMM, {
      source: SessionStorage.get(sessionStorageKeys.legitIntroSource) || 'NONE'
    });

    return () => {
      SessionStorage.remove(sessionStorageKeys.legitIntroSource);
    };
  }, []);

  return (
    <GeneralTemplate disablePadding customStyle={{ position: 'relative' }}>
      <Content>
        <Flexbox direction="vertical" gap={8} customStyle={{ padding: '0 30px' }}>
          <Title variant="h1" weight="bold">
            사진으로
            <br />
            <span>무료감정</span>이 가능해요!
          </Title>
          <Typography variant="h4" customStyle={{ textAlign: 'center', color: common.ui60 }}>
            사진 몇장 추가하고 2배 빨리 판매하세요
          </Typography>
        </Flexbox>
        <Flexbox justifyContent="center" customStyle={{ position: 'relative' }}>
          <IntroImage>
            {(product?.imageThumbnail || product?.imageMain) && (
              <Image
                width={164}
                height={164}
                src={product?.imageThumbnail || product?.imageMain || ''}
                alt="Product Img"
                disableAspectRatio
              />
            )}
          </IntroImage>
          <Image
            width={180}
            height={228}
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/legit/legit-intro.png`}
            alt="Legit Intro"
            disableAspectRatio
            customStyle={{ boxShadow: `0px 32px 40px ${common.line01}` }}
            round={12}
          />
        </Flexbox>
      </Content>
      <CTAButton>
        <Button
          variant="solid"
          size="xlarge"
          brandColor="primary"
          fullWidth
          onClick={handleClickRegisterLegit}
        >
          무료 감정신청하기
        </Button>
        <Typography
          variant="body1"
          weight="bold"
          customStyle={{ padding: 8 }}
          onClick={handleClickCancel}
        >
          다음에하기
        </Typography>
      </CTAButton>
    </GeneralTemplate>
  );
}

const Content = styled.section`
  flex: 1 1 0;
  padding: 132px 20px 114px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Title = styled(Typography)`
  text-align: center;
  word-break: keep-all;

  span {
    color: ${({ theme: { palette } }) => palette.primary.light};
  }
`;

const IntroImage = styled.div`
  position: absolute;
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  top: 20px;
`;

const CTAButton = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0 20px 20px;
`;

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  Initializer.initAccessTokenByCookies(getCookies({ req }));

  return {
    props: {}
  };
}

export default LegitIntro;
