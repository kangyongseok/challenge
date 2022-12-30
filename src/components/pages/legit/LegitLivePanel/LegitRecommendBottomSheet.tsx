import { useEffect } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { BottomSheet, Button, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import LegitCard from '@components/UI/molecules/LegitCard';

import type { ProductResult } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchUserLegitTargets } from '@api/user';
import { postRequestProductLegits } from '@api/productLegit';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getProductType } from '@utils/products';
import { getCookie, setCookie } from '@utils/common';

import { legitOpenRecommendBottomSheetState } from '@recoil/legit';
import { deviceIdState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function LegitRecommendBottomSheet() {
  const router = useRouter();
  const {
    theme: {
      palette: { common, secondary }
    }
  } = useTheme();

  const deviceId = useRecoilValue(deviceIdState);

  const [open, setLegitOpenRecommendBottomSheetState] = useRecoilState(
    legitOpenRecommendBottomSheetState
  );

  const { data: accessUser } = useQueryAccessUser();

  const { data: products = [] } = useQuery(
    queryKeys.users.userLegitTargets(),
    fetchUserLegitTargets,
    {
      enabled: !!accessUser,
      refetchOnMount: true
    }
  );

  const { mutate, isLoading: isLoadingMutation } = useMutation(postRequestProductLegits);

  const handleClickCard = (product: ProductResult) => () => {
    logEvent(attrKeys.legit.CLICK_PRODUCT_DETAIL, {
      name: attrProperty.legitName.LEGIT_MAIN,
      title: attrProperty.legitTitle.WISHRECENT_LEGIT,
      productType: getProductType(product.productSeller.site.id, product.productSeller.type)
    });
    SessionStorage.set(sessionStorageKeys.productDetailEventProperties, {
      source: attrProperty.legitSource.LEGIT_TARGET
    });
    router.push(`/products/${product.id}`);
  };

  const handleClickTodayHidden = () => {
    logEvent(attrKeys.legit.CLICK_NOTTODAY, {
      name: attrProperty.legitName.LEGIT_MAIN,
      title: attrProperty.legitTitle.LEGIT_WISH
    });

    setCookie('hideRecommendLegitProduct', 'done', 1);
    setLegitOpenRecommendBottomSheetState(false);
  };

  const handleClickAll = async () => {
    if (isLoadingMutation) return;

    logEvent(attrKeys.legit.CLICK_LEGIT_WISH, {
      name: attrProperty.legitName.LEGIT_MAIN,
      att: 'OK'
    });

    mutate(
      { productIds: products.map(({ id }) => id), deviceId },
      {
        onSettled: () => {
          setLegitOpenRecommendBottomSheetState(false);
          router.push(
            {
              pathname: '/legit',
              query: {
                tab: 'my',
                openCompleteToast: true
              }
            },
            undefined,
            { shallow: true }
          );
        }
      }
    );
  };

  const handleClickClose = () => {
    logEvent(attrKeys.legit.CLICK_CLOSE, {
      name: attrProperty.legitName.LEGIT_MAIN,
      title: attrProperty.legitTitle.LEGIT_WISH
    });

    setLegitOpenRecommendBottomSheetState(false);
  };

  useEffect(() => {
    if (getCookie('hideRecommendLegitProduct')) return;

    if (accessUser && products.length > 0) {
      setLegitOpenRecommendBottomSheetState(true);
    }
  }, [setLegitOpenRecommendBottomSheetState, accessUser, products.length]);

  useEffect(() => {
    if (open) {
      logEvent(attrKeys.legit.VIEW_LEGIT_WISH, {
        name: attrProperty.legitName.LEGIT_MAIN
      });
    }
  }, [open]);

  return accessUser && products.length > 0 ? (
    <BottomSheet
      open={open}
      onClose={() => setLegitOpenRecommendBottomSheetState(false)}
      disableSwipeable
    >
      <Flexbox direction="vertical" gap={20} customStyle={{ padding: 20 }}>
        <Flexbox direction="vertical" gap={4}>
          <Typography variant="small2" weight="bold" customStyle={{ color: secondary.blue.main }}>
            MY CURATION
          </Typography>
          <Typography variant="h3" weight="bold">
            {accessUser.userName || '회원'}님의 찜/최근 매물 중
            <br />
            사진감정가능한 3개를 추렸어요
          </Typography>
        </Flexbox>
        <Flexbox direction="vertical" gap={20} customStyle={{ justifyContent: 'center' }}>
          {products.map((product) => (
            <LegitCard
              key={`recommend-legit-${product.id}`}
              variant="list"
              productLegit={{ productResult: product }}
              data-product-id={product.id}
              onClick={handleClickCard(product)}
              hidePlatformLogo
              hideLegitLabelWithDate
            />
          ))}
        </Flexbox>
        <Button
          size="large"
          variant="solid"
          fullWidth
          brandColor="primary"
          disabled={isLoadingMutation}
          onClick={handleClickAll}
        >
          모두 실시간 사진감정 해보기
        </Button>
      </Flexbox>
      <Flexbox gap={8} justifyContent="space-between" customStyle={{ padding: 20 }}>
        <Typography
          weight="medium"
          onClick={handleClickTodayHidden}
          customStyle={{ color: common.ui60 }}
        >
          오늘 하루 보지않기
        </Typography>
        <Typography variant="h4" weight="medium" onClick={handleClickClose}>
          닫기
        </Typography>
      </Flexbox>
    </BottomSheet>
  ) : null;
}

export default LegitRecommendBottomSheet;
