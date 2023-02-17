import { memo, useEffect, useRef, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { Box, Flexbox, Icon, Typography, dark, useTheme } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';
import styled, { CSSObject } from '@emotion/styled';

import { fetchLegit } from '@api/dashboard';

import queryKeys from '@constants/queryKeys';
import {
  APP_DOWNLOAD_BANNER_HEIGHT,
  HEADER_HEIGHT,
  IOS_SAFE_AREA_TOP,
  LEGIT_FAKE_BANNER_HEIGHT,
  TAB_HEIGHT
} from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import { showAppDownloadBannerState } from '@recoil/common';
import useScrollTrigger from '@hooks/useScrollTrigger';

function LegitAutoRollingBanner() {
  const {
    theme: {
      palette: { secondary, common }
    }
  } = useTheme();

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  const [fakeIndexData, setFakeIndexData] = useState<
    {
      title: string;
      description: string;
      increaseRate?: number;
    }[]
  >([]);
  const [increaseFakeIndexData, setIncreaseFakeIndexData] = useState(0);

  const initScrollLeftRef = useRef(0);
  const bannerRef = useRef<HTMLDivElement>(null);
  const bannerRollingIntervalRef = useRef<ReturnType<typeof setInterval>>();

  const { data: { fakeInfo } = {} } = useQuery(queryKeys.dashboards.legit(), () => fetchLegit());

  const triggered = useScrollTrigger({
    ref: bannerRef,
    additionalOffsetTop:
      (showAppDownloadBanner ? -APP_DOWNLOAD_BANNER_HEIGHT : 0) -
      HEADER_HEIGHT -
      TAB_HEIGHT -
      (isExtendedLayoutIOSVersion()
        ? Number(
            getComputedStyle(document.documentElement).getPropertyValue('--sat').split('px')[0]
          )
        : 0),
    delay: 0
  });

  useEffect(() => {
    setFakeIndexData([
      { title: '오늘 가품', description: `${fakeInfo?.fakeRate || 0}%` },
      { title: '가품적발', description: `${fakeInfo?.fakeCnt || 0}건` },
      {
        title: '이번주 가품',
        description: `${fakeInfo?.fakeThisWeekCnt || 0}개`,
        increaseRate: Number(
          (fakeInfo?.fakeThisWeekCnt || 0) > (fakeInfo?.fakeLastWeekCnt || 0)
            ? (((fakeInfo?.fakeThisWeekCnt || 0) - (fakeInfo?.fakeLastWeekCnt || 0)) /
                (fakeInfo?.fakeLastWeekCnt || 0)) *
                100
            : 0
        )
      },
      {
        title: '가품 1/2/3위',
        description:
          fakeInfo?.fakeTopBrands.map(({ nameEng }) => nameEng.toUpperCase()).join(' / ') || ''
      }
    ]);
  }, [fakeInfo]);

  useEffect(() => {
    if (bannerRef.current) {
      initScrollLeftRef.current = bannerRef.current.scrollLeft;
    }
  }, [fakeIndexData]);

  useEffect(() => {
    if (increaseFakeIndexData % 2 === 0) {
      setFakeIndexData((prevState) => prevState.splice(0, 4));
    }
  }, [increaseFakeIndexData]);

  useEffect(() => {
    bannerRollingIntervalRef.current = setInterval(() => {
      if (bannerRef.current) {
        const { scrollWidth, clientWidth, scrollLeft } = bannerRef.current;
        bannerRef.current.scrollBy({
          left: 1,
          behavior: 'auto'
        });
        if (scrollWidth - clientWidth - 5 <= scrollLeft) {
          setFakeIndexData((prevState) => prevState.concat(prevState));
          setIncreaseFakeIndexData((prevState) => prevState + 1);
        }
      }
    }, 20);
  }, []);

  useEffect(() => {
    return () => {
      if (bannerRollingIntervalRef.current) {
        clearInterval(bannerRollingIntervalRef.current);
      }
    };
  }, []);

  return (
    <>
      {triggered && <Box customStyle={{ height: LEGIT_FAKE_BANNER_HEIGHT }} />}
      <Banner ref={bannerRef} isFixed={triggered} showAppDownloadBanner={showAppDownloadBanner}>
        {fakeIndexData.map(({ title, description, increaseRate = 0 }, index) => (
          <FakeInfo key={`fake-index-${title}`} showLine={index + 1 !== fakeIndexData.length}>
            <Typography
              variant="body2"
              weight="bold"
              customStyle={{ whiteSpace: 'nowrap', color: common.uiWhite, textAlign: 'center' }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              weight="bold"
              customStyle={{ whiteSpace: 'nowrap', color: secondary.red.light }}
            >
              {description}
            </Typography>
            {!Number.isNaN(increaseRate) && increaseRate > 0 && (
              <Flexbox
                gap={2}
                alignment="center"
                customStyle={{
                  marginLeft: -4
                }}
              >
                <Icon
                  name="DropUpFilled"
                  width={8}
                  height={16}
                  viewBox="0 0 12 24"
                  color={secondary.red.light}
                />
                <Typography
                  variant="body2"
                  weight="bold"
                  customStyle={{ whiteSpace: 'nowrap', color: secondary.red.light }}
                >
                  {Math.round(increaseRate)}%
                </Typography>
              </Flexbox>
            )}
          </FakeInfo>
        ))}
      </Banner>
    </>
  );
}

const Banner = styled.div<{ isFixed: boolean; showAppDownloadBanner: boolean }>`
  display: flex;
  align-items: center;
  background-color: ${({ theme: { palette } }) => palette.common.uiBlack};
  overflow-x: auto;
  transition: top 0.5s;

  ${({ isFixed, showAppDownloadBanner, theme: { zIndex } }): CSSObject =>
    isFixed
      ? {
          position: 'fixed',
          top: `calc(${
            HEADER_HEIGHT + TAB_HEIGHT + (showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0)
          }px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'})`,
          left: 0,
          right: 0,
          zIndex: zIndex.header
        }
      : {}};
`;

const FakeInfo = styled.div<{ showLine: boolean }>`
  position: relative;
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  width: 100%;

  :after {
    ${({ showLine }) =>
      showLine && {
        content: '""',
        backgroundColor: dark.palette.common.line01,
        width: 1,
        height: 16,
        position: 'absolute',
        right: 0
      }};
  }
`;

export default memo(LegitAutoRollingBanner);
