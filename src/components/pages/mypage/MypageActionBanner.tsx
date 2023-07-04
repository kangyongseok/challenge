import { useEffect, useMemo, useState } from 'react';

import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { Box, Flexbox, Icon, Image, Typography, dark, useTheme } from '@mrcamelhub/camel-ui';

import { AppAuthCheckDialog, AppUpdateNoticeDialog } from '@components/UI/organisms';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import {
  CROWD_DATE,
  LEGIT_DATE,
  LISTING_TECH_DATE,
  LISTING_TECH_LEGIT_DATE,
  PORTFOLIO_DATE,
  SAVED_CAMEL_SELLER_PRODUCT_DATA
} from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  checkAgent,
  isNeedUpdateImageUploadAOSVersion,
  isNeedUpdateImageUploadIOSVersion
} from '@utils/common';

import type { SavedLegitDataProps } from '@typings/product';
import type { SaveCamelSellerProductData } from '@typings/camelSeller';
import {
  settingsTransferDataState,
  settingsTransferPlatformsState
} from '@recoil/settingsTransfer';
import { legitRequestState } from '@recoil/legitRequest';
import { camelSellerDialogStateFamily, camelSellerTempSaveDataState } from '@recoil/camelSeller';
import useSession from '@hooks/useSession';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';

function MypageActionBanner() {
  const {
    theme: {
      palette: { common, primary, secondary }
    }
  } = useTheme();
  const router = useRouter();

  const { isLoggedIn, data: accessUser } = useSession();
  const { data: { notProcessedLegitCount = 0, roles = [] } = {} } = useQueryMyUserInfo();

  const [open, setOpen] = useState(false);
  const [openIOSNoticeDialog, setOpenIOSNoticeDialog] = useState(false);
  const [openAOSNoticeDialog, setOpenAOSNoticeDialog] = useState(false);

  const [tempData, setTempData] = useRecoilState(camelSellerTempSaveDataState);
  const setOpenAppDown = useSetRecoilState(camelSellerDialogStateFamily('nonMemberAppdown'));
  const setLegitRequestState = useSetRecoilState(legitRequestState);
  const resetPlatformsState = useResetRecoilState(settingsTransferPlatformsState);
  const resetDataState = useResetRecoilState(settingsTransferDataState);

  const authLegit = useMemo(
    () => roles?.includes('PRODUCT_LEGIT') || roles?.includes('PRODUCT_LEGIT_HEAD'),
    [roles]
  );

  const savedCamelSellerProductData = LocalStorage.get<SaveCamelSellerProductData>(
    SAVED_CAMEL_SELLER_PRODUCT_DATA
  );

  const isSavedData =
    !!savedCamelSellerProductData &&
    isLoggedIn &&
    accessUser &&
    savedCamelSellerProductData[accessUser.snsType];

  const handleClick = () => {
    logEvent(attrKeys.mypage.CLICK_BANNER, {
      name: attrProperty.name.MY,
      title: attrProperty.title.MY,
      att: 'TRANSFER'
    });

    resetPlatformsState();
    resetDataState();
    router.push('/mypage/settings/transfer');
  };

  const handleClickLegit = () => {
    router.push('/legit/admin?tab=request');
  };

  const handleClickCrowd = () => {
    LocalStorage.remove(CROWD_DATE);
    router.push('/legit/request/form');
  };

  const handleClickListingTech = () => {
    if (process.env.NODE_ENV !== 'development') {
      if (!(checkAgent.isIOSApp() || checkAgent.isAndroidApp())) {
        setOpenAppDown(({ type }) => ({
          type,
          open: true
        }));
        return;
      }

      if (isNeedUpdateImageUploadIOSVersion()) {
        setOpenIOSNoticeDialog(true);
        return;
      }

      if (isNeedUpdateImageUploadAOSVersion()) {
        setOpenAOSNoticeDialog(true);
        return;
      }

      if (checkAgent.isAndroidApp() || checkAgent.isIOSApp()) {
        window.getAuthCamera = (result: boolean) => {
          if (!result) {
            setOpen(true);
          }
        };
      }
    }
    if (!isSavedData) return;
    const { ...props } = savedCamelSellerProductData[accessUser.snsType];

    setTempData({
      ...tempData,
      ...props
    });

    router.push('/camelSeller/registerConfirm');
  };

  const handleClickListingTechLegit = () => {
    const saveLegitData: SavedLegitDataProps | null = LocalStorage.get(String(accessUser?.userId));
    if (saveLegitData && saveLegitData.savedLegitRequest) {
      setLegitRequestState((currVal) => ({
        ...currVal,
        ...saveLegitData.savedLegitRequest.state
      }));
      router.push('/legit/request/form?already=true', undefined, { shallow: true });
    }
  };

  const bannerInfo = [
    {
      type: 'legit',
      text: '🧨 감정사님, 감정 신청 건이 많이 밀려있어요!',
      bgColor: secondary.red.light,
      isView: authLegit && notProcessedLegitCount >= 2,
      onClick: handleClickLegit,
      localStorageName: LEGIT_DATE,
      att: 'LEGIT'
    },
    {
      type: 'listingTech',
      text: '👀 올리던 매물을 이어서 등록할까요? ',
      bgColor: primary.light,
      isView: isSavedData,
      onClick: handleClickListingTech,
      localStorageName: LISTING_TECH_DATE,
      att: 'PRODUCT_MAIN'
    },
    {
      type: 'listingTechLegit',
      text: '🕵️ 사진감정등록 중... 신청을 완료해보세요!',
      bgColor: dark.palette.common.bg03,
      isView: !!LocalStorage.get<SavedLegitDataProps | null>(String(accessUser?.userId || ''))
        ?.savedLegitRequest,
      onClick: handleClickListingTechLegit,
      localStorageName: LISTING_TECH_LEGIT_DATE,
      att: 'PRODUCT_MAIN'
    },
    {
      type: 'portfolio',
      text: '💡 내 포트폴리오에 계속해서 등록할까요?',
      bgColor: secondary.purple.main,
      isView: false, // TODO 추후 개발 필요
      localStorageName: PORTFOLIO_DATE,
      att: 'PORTFOLIO'
    },
    {
      type: 'crowd',
      text: '🕵️ 사진 감정신청을 이어서 진행할까요?',
      bgColor: common.ui20,
      isView: !!LocalStorage.get(CROWD_DATE),
      onClick: handleClickCrowd,
      localStorageName: CROWD_DATE,
      att: 'LEGIT_PROCESS'
    }
  ];

  const firstViewData = bannerInfo.filter((info) => {
    const overWeek = dayjs().diff(dayjs(LocalStorage.get(info.localStorageName)), 'day') > 7;
    return info.isView && !overWeek;
  })[0];

  useEffect(() => {
    if (firstViewData) {
      logEvent(attrKeys.mypage.VIEW_BANNER, {
        name: attrProperty.name.MY,
        att: firstViewData.att
      });

      if (!LocalStorage.get(firstViewData.localStorageName))
        LocalStorage.set(firstViewData.localStorageName, dayjs().format('YYYY-MM-DD'));
    } else {
      logEvent(attrKeys.products.VIEW_BANNER, {
        name: attrProperty.name.MY,
        title: attrProperty.title.MY,
        att: 'TRANSFER'
      });
    }
  }, [firstViewData]);

  useEffect(() => {
    if (notProcessedLegitCount < 2 && !!LocalStorage.get('legitDate')) {
      LocalStorage.remove('legitDate');
    }
  }, [notProcessedLegitCount]);

  if (!firstViewData)
    return (
      <Box
        onClick={handleClick}
        customStyle={{
          // backgroundColor: '#4836B6'
          // backgroundColor: '#64607A'
          backgroundColor: '#111A3D'
        }}
      >
        <Image
          height={104}
          // src={`https://${process.env.IMAGE_DOMAIN}/assets/images/home/camel-seller-banner2.png`}
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/my/transfer-banner.png`}
          alt="Banner Img"
          disableAspectRatio
        />
      </Box>
    );

  return (
    <>
      <Flexbox
        justifyContent="space-between"
        alignment="center"
        customStyle={{ background: firstViewData.bgColor, height: 53, padding: '0 20px' }}
        key={firstViewData.type}
        onClick={() => {
          logEvent(attrKeys.mypage.CLICK_BANNER, {
            name: attrProperty.name.MY,
            att: firstViewData.att
          });
          firstViewData?.onClick?.();
        }}
      >
        <Typography weight="medium" customStyle={{ color: common.uiWhite }}>
          {firstViewData.text}
        </Typography>
        <Icon name="CaretRightOutlined" customStyle={{ color: common.uiWhite }} />
      </Flexbox>
      <AppUpdateNoticeDialog
        open={openIOSNoticeDialog}
        onClose={() => setOpenIOSNoticeDialog(false)}
        onClick={() => {
          if (
            window.webkit &&
            window.webkit.messageHandlers &&
            window.webkit.messageHandlers.callExecuteApp
          )
            window.webkit.messageHandlers.callExecuteApp.postMessage(
              'itms-apps://itunes.apple.com/app/id1541101835'
            );
        }}
      />
      <AppUpdateNoticeDialog
        open={openAOSNoticeDialog}
        onClose={() => setOpenAOSNoticeDialog(false)}
        onClick={() => {
          if (window.webview && window.webview.callExecuteApp)
            window.webview.callExecuteApp('market://details?id=kr.co.mrcamel.android');
        }}
      />
      <AppAuthCheckDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export default MypageActionBanner;
