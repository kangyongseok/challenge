import { useCallback, useEffect, useState } from 'react';

import { useRecoilValue, useResetRecoilState } from 'recoil';
import { useMutation } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import omitBy from 'lodash-es/omitBy';
import isUndefined from 'lodash-es/isUndefined';
import styled from '@emotion/styled';

import GeneralTemplate from '@components/templates/GeneralTemplate';

import LocalStorage from '@library/localStorage';

import { fetchArea, postAlarm, postArea, postStyle } from '@api/user';

import {
  IS_DONE_SIGN_IN_PERMISSION,
  SHOW_SAVE_SEARCH_PRODUCTS_POPUP,
  SIGN_UP_STEP
} from '@constants/localStorage';

import checkAgent from '@utils/checkAgent';

import type { FindLocation } from '@typings/common';
import { searchParamsState } from '@recoil/searchHelper';

import OnboardingBottomCTA from './OnboardingBottomCTA';

function OnboardingPermission() {
  const {
    theme: { palette }
  } = useTheme();
  const router = useRouter();
  const {
    keyword,
    brandIds,
    parentIds,
    subParentIds,
    categorySizeIds,
    lineIds,
    minPrice,
    maxPrice,
    idFilterIds,
    siteUrlIds,
    colorIds,
    seasonIds,
    materialIds
  } = useRecoilValue(searchParamsState);
  const resetSearchParams = useResetRecoilState(searchParamsState);
  const { mutate: mutatePostStyle } = useMutation(postStyle);
  const { mutate: mutatePostAlarm } = useMutation(postAlarm);
  const { mutate: mutatePostArea } = useMutation(postArea);
  const [pending, setPending] = useState(false);

  const redirectPage = useCallback(() => {
    // 검색집사 완료 후 매물목록 저장 유도 팝업을 통해 로그인 한 경우
    if (LocalStorage.get(SHOW_SAVE_SEARCH_PRODUCTS_POPUP)) {
      LocalStorage.remove(SHOW_SAVE_SEARCH_PRODUCTS_POPUP);
      router.replace({
        pathname: `/products/search/${keyword}`,
        query: omitBy(
          {
            brandIds,
            parentIds,
            subParentIds,
            categorySizeIds,
            lineIds,
            minPrice,
            maxPrice,
            idFilterIds,
            siteUrlIds,
            colorIds,
            seasonIds,
            materialIds
          },
          isUndefined
        )
      });
      resetSearchParams();
      return;
    }

    router.push('/');
  }, [
    brandIds,
    categorySizeIds,
    colorIds,
    idFilterIds,
    keyword,
    lineIds,
    materialIds,
    maxPrice,
    minPrice,
    parentIds,
    resetSearchParams,
    router,
    seasonIds,
    siteUrlIds,
    subParentIds
  ]);

  const handleClick = useCallback(() => {
    setPending(true);

    mutatePostStyle({ parentCategoryIds: null, subParentCategoryIds: null });
    LocalStorage.remove(SIGN_UP_STEP);
    LocalStorage.set(IS_DONE_SIGN_IN_PERMISSION, true);

    if (checkAgent.isAndroidApp()) {
      window.webview.callAuthPush();
      window.webview.callAuthLocation();
      return;
    }

    if (checkAgent.isIOSApp()) {
      window.webkit.messageHandlers.callAuthPush.postMessage(0);
      window.webkit.messageHandlers.callAuthLocation.postMessage(0);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { longitude, latitude } = position.coords;

        if (longitude > 0 || latitude > 0) {
          const { name, x, y } = await fetchArea({ x: String(longitude), y: String(latitude) });

          mutatePostArea(
            { name, x, y },
            {
              onSuccess: () => redirectPage(),
              onError: () => redirectPage()
            }
          );
        } else {
          redirectPage();
        }
      },
      () => {
        redirectPage();
      }
    );
  }, [mutatePostArea, mutatePostStyle, redirectPage]);

  useEffect(() => {
    window.getAuthPush = (result: boolean) => {
      if (result) mutatePostAlarm(true);
    };

    window.getAuthLocation = async ({ lng, lat }: FindLocation) => {
      if (lng || lat) {
        const { name, x, y } = await fetchArea({ x: lng, y: lat });

        mutatePostArea(
          { name, x, y },
          {
            onSuccess: () => router.push('/'),
            onError: () => router.push('/')
          }
        );
      } else {
        router.replace('/');
      }
    };
  }, [mutatePostAlarm, mutatePostArea, router]);

  return (
    <>
      <GeneralTemplate hideAppDownloadBanner>
        <Typography
          variant="h2"
          weight="bold"
          customStyle={{ padding: '52px 0px', '& > span': { color: palette.primary.main } }}
        >
          꿀매물 <span>득템 확률 2배</span> 상승!
          <br />
          권한 허용하고 꿀매물 받아보세요
        </Typography>
        <Flexbox gap={32} direction="vertical" customStyle={{ paddingBottom: 32, flex: 1 }}>
          <Flexbox gap={16}>
            <IconBox>
              <PinIcon />
            </IconBox>
            <Box>
              <Typography variant="h4" weight="bold">
                위치(선택)
              </Typography>
              <Typography
                variant="body1"
                weight="medium"
                customStyle={{ color: palette.common.grey['40'] }}
              >
                당근마켓 ‧ 직거래 매물만 골라 볼 수 있어요
              </Typography>
            </Box>
          </Flexbox>
          <Flexbox gap={16}>
            <IconBox>
              <AlarmIcon />
            </IconBox>
            <Box>
              <Typography variant="h4" weight="bold">
                알림(선택)
              </Typography>
              <Typography
                variant="body1"
                weight="medium"
                customStyle={{ color: palette.common.grey['40'] }}
              >
                꿀매물, 가격 변동 알림 등을 받아보실 수 있어요
              </Typography>
            </Box>
          </Flexbox>
        </Flexbox>
      </GeneralTemplate>
      <Flexbox direction="vertical" alignment="center" customStyle={{ paddingTop: 20 }}>
        <Label variant="body1" weight="medium" customStyle={{ color: palette.common.grey['60'] }}>
          단말 설정에서 언제든 변경할 수 있어요.
        </Label>
        <OnboardingBottomCTA onClick={handleClick} disabled={pending}>
          시작하기
        </OnboardingBottomCTA>
      </Flexbox>
    </>
  );
}

const IconBox = styled.div`
  height: 52px;
  width: 52px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.palette.primary.highlight};
`;

const Label = styled(Typography)`
  margin: 0 auto;
  width: fit-content;
  background-color: ${({ theme: { palette } }) => palette.common.grey['95']};
  border-radius: 36px;
  padding: 8px 16px;
`;

function AlarmIcon() {
  return (
    <svg
      width="24"
      height="25"
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <path d="M0 24.68H24V0.68H0V24.68Z" fill="url(#pattern0)" />
      <defs>
        <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
          <use xlinkHref="#image0_1190_1222" transform="scale(0.015625)" />
        </pattern>
        <image
          id="image0_1190_1222"
          width="64"
          height="64"
          xlinkHref="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      width="24"
      height="25"
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <path d="M0 24.68H24V0.68H0V24.68Z" fill="url(#pattern1)" />
      <defs>
        <pattern id="pattern1" patternContentUnits="objectBoundingBox" width="1" height="1">
          <use xlinkHref="#image0_1190_3909" transform="scale(0.015625)" />
        </pattern>
        <image
          id="image0_1190_3909"
          width="64"
          height="64"
          xlinkHref="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
}

export default OnboardingPermission;
