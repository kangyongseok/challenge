import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Flexbox, Icon, Typography, dark, useTheme } from 'mrcamel-ui';
import { find } from 'lodash-es';
import styled from '@emotion/styled';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import { PROMOTION_ATT } from '@constants/product';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { SavedLegitState } from '@typings/product';
import { legitRequestState } from '@recoil/legitRequest';
import { camelSellerIsMovedScrollState, camelSellerTempSaveDataState } from '@recoil/camelSeller';

function UserShopProductActionBanner({
  labelId,
  productId,
  isTransferred,
  platformName,
  savedLegitData,
  synonyms,
  attributes
}: {
  labelId: number;
  productId: number;
  isTransferred: boolean;
  platformName: string;
  savedLegitData?: SavedLegitState;
  synonyms?: string;
  attributes?: {
    name?: string;
    title?: string;
    source?: string;
    index?: number;
  };
}) {
  const router = useRouter();
  const {
    theme: {
      palette: { common, primary }
    }
  } = useTheme();
  const resetCamelSellerMoveScroll = useResetRecoilState(camelSellerIsMovedScrollState);
  const resetSaveData = useResetRecoilState(camelSellerTempSaveDataState);
  const setLegitRequestState = useSetRecoilState(legitRequestState);
  const { primary: darkPrimary, common: darkCommon } = dark.palette;

  const handleClickListingTechLegit = () => {
    if (savedLegitData) {
      setLegitRequestState((currVal) => ({
        ...currVal,
        ...savedLegitData
      }));
      return '/legit/request/form?already=true';
    }
    return '';
  };

  const actionBannerInfo = [
    {
      id: 0,
      iconName: <Icon name="LegitFilled" size="small" customStyle={{ color: darkPrimary.light }} />,
      text: '감정 등록중인 매물입니다! 추가 사진을 등록해주세요!',
      backgroundColor: darkCommon.bg03,
      theme: 'dark',
      action: handleClickListingTechLegit(),
      att: PROMOTION_ATT.LEGIT_SAVED
    },
    {
      id: 3879,
      iconName: <Icon name="LegitFilled" size="small" customStyle={{ color: darkPrimary.light }} />,
      text: '사진감정 중 보완요청 사항이있어요!',
      backgroundColor: darkCommon.bg03,
      theme: 'dark',
      action: { pathname: '/legit/request/edit', query: { productId } },
      att: PROMOTION_ATT.LEGIT_EDIT
    },
    {
      id: 3875,
      iconName: <Icon name="WonFilled" size="small" customStyle={{ color: primary.light }} />,
      text: '가격조정하면 더 빨리 팔릴 것 같아요!',
      backgroundColor: common.bg02,
      theme: 'light',
      action: `/camelSeller/registerConfirm/${productId}?anchor=price`,
      att: PROMOTION_ATT.PRICE
    },
    {
      id: 3876,
      iconName: <Icon name="LegitFilled" size="small" customStyle={{ color: primary.light }} />,
      text: '무료사진감정 대상 매물입니다!',
      backgroundColor: common.bg02,
      theme: 'light',
      action: `/legit/intro?productId=${productId}&register=true`,
      att: PROMOTION_ATT.LEGIT
    },
    {
      id: 3877,
      iconName: <Icon name="Arrow4UpFilled" size="small" customStyle={{ color: primary.light }} />,
      text: `${synonyms} 입력하면 한 달 동안 매일 자동으로 끌올!`,
      backgroundColor: common.bg02,
      theme: 'light',
      action: `/camelSeller/registerConfirm/${productId}?anchor=surveyForm`,
      att: PROMOTION_ATT.INFO
    }
  ];

  const findBanner = find(actionBannerInfo, {
    id: labelId
  });

  const handleClickBanner = () => {
    if (findBanner) {
      logEvent(attrKeys.userShop.CLICK_BANNER, {
        ...attributes,
        name: attrProperty.name.MY_STORE,
        title: attrProperty.title.SALES_PROMOTION,
        att: findBanner.att
      });

      if (findBanner.att === 'PRICE' || findBanner.att === 'INFO') {
        resetCamelSellerMoveScroll();
        resetSaveData();
      }

      SessionStorage.set(sessionStorageKeys.legitIntroSource, 'MY_STORE');

      router.push(findBanner.action);
    }
  };

  if (!isTransferred) {
    return (
      <ActionBannerWrap alignment="center" bg={common.bg02} gap={4} onClick={handleClickBanner}>
        <Icon name="Rotate2Outlined" width={16} height={16} color={primary.light} />
        <Typography variant="small1" weight="medium" customStyle={{ color: common.ui20 }}>
          {platformName} 플랫폼과 동기화된 매물이에요.
        </Typography>
      </ActionBannerWrap>
    );
  }

  return (
    <ActionBannerWrap
      alignment="center"
      bg={findBanner?.backgroundColor || ''}
      gap={4}
      onClick={handleClickBanner}
    >
      {findBanner?.iconName}
      <Typography
        variant="small1"
        weight="medium"
        customStyle={{ color: findBanner?.theme === 'dark' ? darkCommon.uiBlack : common.ui20 }}
      >
        {findBanner?.text}
      </Typography>
      <Icon
        name="CaretRightOutlined"
        customStyle={{ marginLeft: 'auto', color: darkCommon.ui60 }}
        size="small"
      />
    </ActionBannerWrap>
  );
}

const ActionBannerWrap = styled(Flexbox)<{ bg: string }>`
  height: 40px;
  border-radius: 8px;
  background: ${({ bg }) => bg};
  margin-top: 12px;
  padding: 0 12px;
  margin-bottom: 32px;
`;

export default UserShopProductActionBanner;
