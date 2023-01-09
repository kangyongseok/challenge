import { useEffect, useMemo } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';

import { Gap } from '@components/UI/atoms';

import LocalStorage from '@library/localStorage';

import {
  CAMEL_SELLER,
  CROWD_DATE,
  LEGIT_DATE,
  LISTING_TECH_DATE,
  PORTFOLIO_DATE
} from '@constants/localStorage';

import {
  checkAgent,
  isNeedUpdateImageUploadAOSVersion,
  isNeedUpdateImageUploadIOSVersion
} from '@utils/common';

import type { CamelSellerLocalStorage } from '@typings/camelSeller';
import { dialogState } from '@recoil/common';
import { camelSellerDialogStateFamily, camelSellerTempSaveDataState } from '@recoil/camelSeller';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';

function MypageActionBanner() {
  const {
    theme: {
      palette: { common, primary, secondary }
    }
  } = useTheme();
  const router = useRouter();
  const { data: { notProcessedLegitCount = 0, roles = [] } = {} } = useQueryMyUserInfo();
  const [tempData, setTempData] = useRecoilState(camelSellerTempSaveDataState);
  const setOpenAppDown = useSetRecoilState(camelSellerDialogStateFamily('nonMemberAppdown'));
  const setDialogState = useSetRecoilState(dialogState);

  useEffect(() => {
    if (notProcessedLegitCount < 2 && !!LocalStorage.get('legitDate')) {
      LocalStorage.remove('legitDate');
    }
  }, [notProcessedLegitCount]);

  const authLegit = useMemo(
    () => roles.includes('PRODUCT_LEGIT') || roles.includes('PRODUCT_LEGIT_HEAD'),
    [roles]
  );

  const isSaveSellerData = LocalStorage.get(CAMEL_SELLER);

  const handleClickLegit = () => {
    router.push('/legit/admin?tab=request');
  };

  const handleClickCrowd = () => {
    LocalStorage.remove(CROWD_DATE);
    router.push('/legit/request/form');
  };

  const handleClickListingTech = () => {
    const saveData = LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage;

    if (process.env.NODE_ENV !== 'development') {
      if (!(checkAgent.isIOSApp() || checkAgent.isAndroidApp())) {
        setOpenAppDown(({ type }) => ({
          type,
          open: true
        }));
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

      if (checkAgent.isAndroidApp() || checkAgent.isIOSApp()) {
        window.getAuthCamera = (result: boolean) => {
          if (!result) {
            setDialogState({
              type: 'appAuthCheck',
              customStyleTitle: { minWidth: 269, marginTop: 12 },
              firstButtonAction: () => {
                if (
                  checkAgent.isIOSApp() &&
                  window.webkit &&
                  window.webkit.messageHandlers &&
                  window.webkit.messageHandlers.callMoveToSetting &&
                  window.webkit.messageHandlers.callMoveToSetting.postMessage
                ) {
                  window.webkit.messageHandlers.callMoveToSetting.postMessage(0);
                }
                if (checkAgent.isAndroidApp() && window.webview && window.webview.moveToSetting) {
                  window.webview.moveToSetting();
                }
              }
            });
          }
        };
      }
    }

    setTempData({
      ...tempData,
      title: saveData.title,
      color: saveData.color,
      size: saveData.size,
      price: saveData.price,
      condition: saveData.condition,
      quoteTitle: saveData.quoteTitle,
      description: saveData.description,
      photoGuideImages: saveData.photoGuideImages
    });

    router.push({
      pathname: '/camelSeller/registerConfirm',
      query: {
        title: saveData.title || saveData.quoteTitle || saveData.brand?.name,
        brandIds: saveData.brand.id,
        brandName: saveData.brand?.name,
        categoryIds: saveData.category.id,
        categoryName: saveData.category.name
        // subParentCategoryName: data.subParentCategoryName
      }
    });
  };

  const bannerInfo = [
    {
      type: 'legit',
      text: '🧨 감정사님, 감정 신청 건이 많이 밀려있어요!',
      bgColor: secondary.red.light,
      isView: authLegit && notProcessedLegitCount >= 2,
      onClick: handleClickLegit,
      localStorageName: LEGIT_DATE
    },
    {
      type: 'listingTech',
      text: '👀 올리던 매물을 이어서 등록할까요? ',
      bgColor: primary.light,
      isView: isSaveSellerData,
      onClick: handleClickListingTech,
      localStorageName: LISTING_TECH_DATE
    },
    {
      type: 'portfolio',
      text: '💡 내 포트폴리오에 계속해서 등록할까요?',
      bgColor: secondary.purple.main,
      isView: false, // TODO 추후 개발 필요
      localStorageName: PORTFOLIO_DATE
    },
    {
      type: 'crowd',
      text: '🕵️ 사진 감정신청을 이어서 진행할까요?',
      bgColor: common.ui20,
      isView: !!LocalStorage.get(CROWD_DATE),
      onClick: handleClickCrowd,
      localStorageName: CROWD_DATE
    }
  ];

  const firstViewData = bannerInfo.filter((info) => {
    const overWeek = dayjs().diff(dayjs(LocalStorage.get(info.localStorageName)), 'day') > 7;
    return info.isView && !overWeek;
  })[0];

  useEffect(() => {
    if (firstViewData && !LocalStorage.get(firstViewData.localStorageName)) {
      LocalStorage.set(firstViewData.localStorageName, dayjs().format('YYYY-MM-DD'));
    }
  }, [firstViewData]);

  if (!firstViewData) return <Gap height={8} />;

  return (
    <Flexbox
      justifyContent="space-between"
      alignment="center"
      customStyle={{ background: firstViewData.bgColor, height: 53, padding: '0 20px' }}
      key={firstViewData.type}
      onClick={firstViewData.onClick}
    >
      <Typography weight="medium" customStyle={{ color: common.uiWhite }}>
        {firstViewData.text}
      </Typography>
      <Icon name="CaretRightOutlined" customStyle={{ color: common.uiWhite }} />
    </Flexbox>
  );
}

export default MypageActionBanner;
