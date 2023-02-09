import { useEffect } from 'react';

import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Image, Skeleton, Typography } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';

import { LegitStatusCard, LegitStatusCardSkeleton } from '@components/UI/molecules';

import type { ProductResult } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchMyProductLegits } from '@api/productLegit';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { postType } from '@constants/productlegits';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  commaNumber,
  getProductDetailUrl,
  isNeedUpdateImageUploadAOSVersion,
  isNeedUpdateImageUploadIOSVersion
} from '@utils/common';

import { productLegitEditParamsState } from '@recoil/legitRequest';
import { dialogState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function LegitMyPanel() {
  const router = useRouter();

  const { data: accessUser } = useQueryAccessUser();

  const setDialogState = useSetRecoilState(dialogState);

  const {
    data: { content: productLegits = [], totalElements = 0 } = {},
    isLoading,
    isFetching
  } = useQuery(queryKeys.users.myProductLegits(), fetchMyProductLegits, {
    enabled: !!accessUser,
    keepPreviousData: true,
    refetchOnMount: true,
    onSuccess(data) {
      if (data && data.content.length > 0) {
        logEvent(attrKeys.legit.VIEW_LEGIT_MY);
      }
    }
  });
  const resetProductLegitEditParamsState = useResetRecoilState(productLegitEditParamsState);

  const getLogEventTitle = (status: number) => {
    switch (status) {
      case 30:
        return attrProperty.legitTitle.AUTHORIZED; // 감정완료
      case 20:
        return attrProperty.legitTitle.AUTHENTICATING; // 감정중
      case 10:
        return attrProperty.legitTitle.PRE_CONFIRM; // 감정신청
      case 11:
        return attrProperty.legitTitle.PRE_CONFIRM_FAIL; // 감정불가
      case 12:
        return attrProperty.legitTitle.PRE_CONFIRM_EDIT; // 감정불가 수정하기
      default:
        return attrProperty.legitTitle.PRE_CONFIRM_EDIT_DONE; // 보완완료
    }
  };

  const handleClick =
    ({ product, status }: { product: ProductResult; status: number }) =>
    () => {
      const isRequestLegit = product.sellerType !== 0 && product.status === 7;

      logEvent(attrKeys.legit.CLICK_LEGIT_INFO, {
        name: attrProperty.legitName.LEGIT_MY,
        title: getLogEventTitle(status),
        att: product.postType === 0 ? '크롤링' : isRequestLegit && '사진올려감정신청'
      });

      if (status >= 20) {
        router.push(
          `/legit${getProductDetailUrl({ product, type: 'productResult' }).replace(
            '/products',
            ''
          )}/result`
        );
      } else if (status === 12 && isRequestLegit) {
        if (isNeedUpdateImageUploadIOSVersion()) {
          setDialogState({
            type: 'appUpdateNotice',
            customStyleTitle: { minWidth: 269 },
            secondButtonAction: () => {
              if (
                window.webkit &&
                window.webkit.messageHandlers &&
                window.webkit.messageHandlers.callExecuteApp
              )
                window.webkit.messageHandlers.callExecuteApp.postMessage(
                  'itms-apps://itunes.apple.com/app/id1541101835'
                );
            }
          });

          return;
        }

        if (isNeedUpdateImageUploadAOSVersion()) {
          setDialogState({
            type: 'appUpdateNotice',
            customStyleTitle: { minWidth: 269 },
            secondButtonAction: () => {
              if (window.webview && window.webview.callExecuteApp)
                window.webview.callExecuteApp('market://details?id=kr.co.mrcamel.android');
            }
          });

          return;
        }

        resetProductLegitEditParamsState();
        router.push({ pathname: '/legit/request/edit', query: { productId: product.id } });
      } else if ((status === 10 || status === 13) && postType[product.postType] === postType[2]) {
        if (isNeedUpdateImageUploadIOSVersion()) {
          setDialogState({
            type: 'appUpdateNotice',
            customStyleTitle: { minWidth: 269 },
            secondButtonAction: () => {
              if (
                window.webkit &&
                window.webkit.messageHandlers &&
                window.webkit.messageHandlers.callExecuteApp
              )
                window.webkit.messageHandlers.callExecuteApp.postMessage(
                  'itms-apps://itunes.apple.com/app/id1541101835'
                );
            }
          });

          return;
        }

        if (isNeedUpdateImageUploadAOSVersion()) {
          setDialogState({
            type: 'appUpdateNotice',
            customStyleTitle: { minWidth: 269 },
            secondButtonAction: () => {
              if (window.webview && window.webview.callExecuteApp)
                window.webview.callExecuteApp('market://details?id=kr.co.mrcamel.android');
            }
          });

          return;
        }

        router.push({
          pathname: '/legit/request',
          query: {
            id: product.id
          }
        });
      } else {
        router.push(
          `/legit${getProductDetailUrl({ product, type: 'productResult' }).replace(
            '/products',
            ''
          )}`
        );
      }
    };

  const handleClickButton = () => {
    logEvent(attrKeys.legit.CLICK_LEGIT_HOWITWORKS, {
      name: attrProperty.legitName.LEGIT_MY
    });

    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.legitName.LEGIT,
      title: attrProperty.legitTitle.MYLEGIT,
      type: attrProperty.legitType.GUIDED
    });

    router.push('/legit/guide');
  };

  useEffect(() => {
    logEvent(attrKeys.legit.VIEW_LEGIT_MY);
  }, []);

  if ((!isFetching && !productLegits.length) || !accessUser) {
    return (
      <Box component="section" customStyle={{ marginTop: 56 }}>
        <Image
          width={181}
          height={232}
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/legit/legit-my-guide_v3.png`}
          alt="Legit Guide Img"
          round={16}
          disableAspectRatio
          customStyle={{ margin: 'auto', boxShadow: '0px 16px 32px rgba(0, 0, 0, 0.1)' }}
        />
        <Flexbox direction="vertical" gap={8} customStyle={{ marginTop: 37, textAlign: 'center' }}>
          <Typography variant="h2" weight="bold">
            사진으로 감정하세요!
          </Typography>
          <Typography>
            정품, 가품 궁금하다면
            <br />
            지금 바로 무료사진감정 신청해보세요 🕵️‍
          </Typography>
        </Flexbox>
        <Box customStyle={{ margin: '74px 0 55px', padding: '0 20px' }}>
          <Button
            variant="solid"
            brandColor="primary"
            size="large"
            fullWidth
            onClick={handleClickButton}
          >
            카멜의 사진감정 더 알아보기
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box component="section" customStyle={{ padding: '0 20px', marginTop: 21 }}>
      {isLoading ? (
        <Skeleton width={70} height={16} round={8} disableAspectRatio />
      ) : (
        <Typography variant="body2" weight="bold">
          전체 {commaNumber(totalElements)}개
        </Typography>
      )}
      <Flexbox direction="vertical" gap={20} customStyle={{ margin: '20px 0 20px' }}>
        {isLoading
          ? Array.from({ length: 10 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <LegitStatusCardSkeleton key={`my-legit-${index}`} />
            ))
          : productLegits.map((productLegit) => (
              <LegitStatusCard
                key={`my-product-legit-${productLegit.productId}`}
                productLegit={productLegit}
                onClick={handleClick({
                  product: productLegit.productResult,
                  status: productLegit.status
                })}
              />
            ))}
      </Flexbox>
    </Box>
  );
}

export default LegitMyPanel;
