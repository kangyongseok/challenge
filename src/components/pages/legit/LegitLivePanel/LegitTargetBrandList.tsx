import { useCallback, useMemo } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper';
import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Flexbox, Skeleton, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchLegit } from '@api/dashboard';

import queryKeys from '@constants/queryKeys';
import { SAVED_LEGIT_REQUEST } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  checkAgent,
  getImageResizePath,
  handleClickAppDownload,
  isNeedUpdateImageUploadAOSVersion,
  isNeedUpdateImageUploadIOSVersion
} from '@utils/common';

import { legitRequestState } from '@recoil/legitRequest';
import { dialogState } from '@recoil/common';
import useQueryUserData from '@hooks/useQueryUserData';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function LegitTargetBrandList() {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const setLegitRequestState = useSetRecoilState(legitRequestState);
  const setDialogState = useSetRecoilState(dialogState);

  const { data: accessUser } = useQueryAccessUser();
  const { data: userData, remove: removeUserDate } = useQueryUserData();

  const { data: { targetBrands = [] } = {}, isLoading } = useQuery(
    queryKeys.dashboards.legit(),
    () => fetchLegit()
  );

  const groupedBrands = useMemo(
    () =>
      Array.from(
        {
          length:
            Math.floor(targetBrands.length / 8) + (Math.floor(targetBrands.length % 8) > 0 ? 1 : 0)
        },
        (_, index) => targetBrands.slice(index * 8, index * 8 + 8)
      ).filter((groupedBrand) => groupedBrand.length),
    [targetBrands]
  );

  const handleClick = useCallback(
    (brandId: number, brandName: string, brandLogo: string) => () => {
      logEvent(attrKeys.legit.CLICK_LEGIT_PROCESS, {
        name: attrProperty.legitName.LEGIT_MAIN,
        title: attrProperty.legitTitle.BRAND
      });

      if (!checkAgent.isMobileApp()) {
        setDialogState({
          type: 'legitRequestOnlyInApp',
          customStyleTitle: { minWidth: 270 },
          secondButtonAction() {
            handleClickAppDownload({});
          }
        });

        return;
      }

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

      if (!accessUser) {
        router.push({ pathname: '/login', query: { returnUrl: '/legit/request/selectCategory' } });

        return;
      }

      // 매물등록 후 사진감정 신청 중단한 케이스 있을 경우 초기화
      if (userData?.[SAVED_LEGIT_REQUEST]?.state?.productId) removeUserDate(SAVED_LEGIT_REQUEST);

      setLegitRequestState((currVal) => ({
        ...currVal,
        brandId,
        brandName,
        brandLogo: `https://${process.env.IMAGE_DOMAIN}/assets/images/brands/transparent/${brandLogo
          .toLowerCase()
          .replace(/\s/g, '')}.png`
      }));
      router.push('/legit/request/selectCategory');
    },
    [accessUser, removeUserDate, router, setDialogState, setLegitRequestState, userData]
  );

  const handleSwiperBrand = () => {
    logEvent(attrKeys.legit.SWIPE_X_BRAND, {
      name: attrProperty.legitName.LEGIT_MAIN
    });
  };

  return (
    <Flexbox component="section" direction="vertical" gap={32}>
      <Flexbox direction="vertical" alignment="center" gap={4}>
        <Typography variant="h3" weight="bold">
          Select a Brand
        </Typography>
        <Typography variant="body2" customStyle={{ color: common.ui60 }}>
          브랜드를 선택하여 사진감정 시작하세요
        </Typography>
      </Flexbox>
      <Wrapper>
        <Swiper
          spaceBetween={20}
          pagination={{ clickable: true }}
          modules={[Pagination]}
          style={{ padding: '0 12px' }}
          onSlideChange={handleSwiperBrand}
        >
          {isLoading ? (
            <SwiperSlide>
              <BrandList>
                {Array.from({ length: 8 }).map((_, index) => (
                  <BrandItem
                    // eslint-disable-next-line react/no-array-index-key
                    key={`target-brand-skeleton-${index}`}
                  >
                    <Skeleton width={64} height={64} round="50%" />
                    <Skeleton width={64} height={18} round={8} disableAspectRatio />
                  </BrandItem>
                ))}
              </BrandList>
            </SwiperSlide>
          ) : (
            groupedBrands.map((groupedBrand, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <SwiperSlide key={`grouped-target-brand-${index}`}>
                <BrandList>
                  {groupedBrand.map(({ id, name, nameEng }) => (
                    <BrandItem
                      key={`target-brand-${id}`}
                      css={{
                        gridAutoColumns: 'minmax(87.5px, 1fr)'
                      }}
                    >
                      <Avatar
                        width={64}
                        height={64}
                        src={getImageResizePath({
                          imagePath: `https://${
                            process.env.IMAGE_DOMAIN
                          }/assets/images/brands/white/${nameEng
                            .toLocaleLowerCase()
                            .split(' ')
                            .join('')}.jpg`,
                          w: 64
                        })}
                        alt="Brand Logo Img"
                        round="50%"
                        onClick={handleClick(id, name, nameEng)}
                        customStyle={{ margin: 'auto' }}
                      />
                      <Typography variant="body1" customStyle={{ textAlign: 'center' }}>
                        {name}
                      </Typography>
                    </BrandItem>
                  ))}
                </BrandList>
              </SwiperSlide>
            ))
          )}
        </Swiper>
      </Wrapper>
    </Flexbox>
  );
}

const Wrapper = styled.div`
  .swiper-initialized {
    height: 260px;
  }
  .swiper-slide {
    margin-right: 20px;
  }
  .swiper-pagination {
    /* bottom: -10px; */
  }
  .swiper-pagination-bullet {
    width: 6px;
    height: 6px;
    background-color: ${({ theme: { palette } }) => palette.common.ui90};
    opacity: 1;
    margin: 0 2px !important;
  }
  .swiper-pagination-bullet-active {
    border-radius: 16px;
    background-color: ${({ theme: { palette } }) => palette.common.uiBlack};
  }
`;

const BrandList = styled.div`
  width: calc(100vw - 24px);
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px 12px;
  margin-bottom: 24px;
`;

const BrandItem = styled.div`
  text-align: center;
  position: relative;
  width: 100%;
  height: fit-content;
  display: grid;
  justify-content: center;
  row-gap: 8px;
  grid-auto-columns: minmax(0, 64px);
  grid-template-rows: 64px 18px;
  cursor: pointer;
`;

export default LegitTargetBrandList;
