import { useEffect, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { MyShopAppDownloadDialog } from '@components/UI/organisms';
import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { EventFullImage, EventRegisterDialog } from '@components/pages/event';

import LocalStorage from '@library/localStorage';

import { fetchSurvey } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { CHECKED_PRODUCT_PHOTO_UPLOAD_GUIDE } from '@constants/localStorage';
import { APP_DOWNLOAD_BANNER_HEIGHT, EVENT_END_DATE, EVENT_START_DATE } from '@constants/common';
import attrProperty from '@constants/attrProperty';

import { EventTime } from '@utils/eventTimes';
import { checkAgent } from '@utils/common';

import { dialogState, showAppDownloadBannerState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useMoveCamelSeller from '@hooks/useMoveCamelSeller';

function CamelSellerEvent() {
  // TODO isExtendedLayoutIOSVersion 적용 필요
  const router = useRouter();

  const isMoweb = !(checkAgent.isIOSApp() || checkAgent.isAndroidApp());
  const setDialogState = useSetRecoilState(dialogState);
  const [isOpen, setIsOpen] = useState(false);
  // const { asPaths, index } = useRecoilValue(historyState);
  const evnetDateInfo = EventTime(EVENT_START_DATE, EVENT_END_DATE);
  const { data: accessUser } = useQueryAccessUser();
  const { data } = useQuery(queryKeys.client.survey(), fetchSurvey, {
    enabled: !!accessUser,
    refetchOnMount: true
  });

  useEffect(() => {
    LocalStorage.set(CHECKED_PRODUCT_PHOTO_UPLOAD_GUIDE, true);
  }, []);

  useEffect(() => {
    if (router.query.login) {
      setIsOpen(true);
    }
  }, [router.query.login]);

  const handleClickBack = () => {
    if (router.query.first) {
      router.replace('/camelSeller/registerConfirm');
    } else {
      router.back();
    }

    // const prevAsPath = asPaths[index - 1];
    // console.log(prevAsPath)
    // if (prevAsPath && prevAsPath.indexOf('/camelSeller/registerConfirm') !== -1) {
    //   router.back();
    // } else {
    //   router.replace('/camelSeller/registerConfirm');
    // }
  };

  const handleClick = useMoveCamelSeller({
    attributes: {
      name: attrProperty.name.EVENT_DETAIL,
      title: attrProperty.title.EVENT_DETAIL,
      source: 'EVENT_DETAIL'
    }
  });

  // const handleClick = () => {
  //   if (evnetDateInfo.isEvent) {
  //     useMoveCamelSeller({
  //       attributes: {
  //         name: attrProperty.name.MAIN,
  //         title: attrProperty.title.MAIN_BANNER,
  //         source: 'MAIN',
  //         index: 2
  //       }
  //     });
  //     if (isMoweb) {
  //       setDialogState({
  //         type: 'featureIsMobileAppDown',
  //         customStyleTitle: { minWidth: 311 },
  //         secondButtonAction() {
  //           handleClickAppDownload({});
  //         }
  //       });
  //     } else {
  //       if (!accessUser) {
  //         setLoginBottomSheet({ open: true, returnUrl: '/events/camelSellerEvent?login=true' });
  //         return;
  //       }
  //       setIsOpen(true);
  //     }
  //     return;
  //   }
  //   if (!evnetDateInfo.isEnd) {
  // setDialogState({
  //   type: 'endEvent',
  //   customStyleTitle: { minWidth: 311 }
  // });
  //   }
  // };

  return (
    <GeneralTemplate
      disablePadding
      header={
        <Header hideTitle hideHeart showRight={false} isTransparent onClickLeft={handleClickBack} />
      }
      footer={
        <FixButton
          justifyContent="center"
          alignment="center"
          style={{ position: 'fixed', bottom: 0, left: 0, width: '100%' }}
          isEvent={evnetDateInfo.isEvent}
        >
          {evnetDateInfo.isEvent ? (
            <Button
              fullWidth
              size="xlarge"
              variant="solid"
              onClick={() => {
                if (!isMoweb && accessUser && evnetDateInfo.isEvent) {
                  if (!data) {
                    setIsOpen(true);
                    return;
                  }
                }
                if (!evnetDateInfo.isEvent) {
                  setDialogState({
                    type: 'endEvent',
                    customStyleTitle: { minWidth: 311 }
                  });
                  return;
                }
                handleClick();
              }}
            >
              {isMoweb ? '카멜앱에서 판매 시작하기' : '판매 시작하기'}
            </Button>
          ) : (
            <Button fullWidth size="xlarge" variant="ghost">
              {!evnetDateInfo.isStart && '이벤트 준비중입니다.'}
              {!evnetDateInfo.isEnd && '종료된 이벤트입니다.'}
            </Button>
          )}
        </FixButton>
      }
    >
      <Box
        customStyle={{
          position: 'absolute',
          top: `calc(${showAppDownloadBannerState ? APP_DOWNLOAD_BANNER_HEIGHT : 0}px)`
        }}
      >
        <EventFullImage />
      </Box>
      <EventRegisterDialog open={isOpen} close={() => setIsOpen(false)} />
      <MyShopAppDownloadDialog />
    </GeneralTemplate>
  );
}

const FixButton = styled(Flexbox)<{ isEvent: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 56px;
  background: ${({
    theme: {
      palette: { common }
    },
    isEvent
  }) => (isEvent ? common.ui20 : common.ui95)};
  ${({ isEvent }) =>
    isEvent &&
    `button {
    background: none;
    border: none;
    color: #ffda46;
    font-weight: 900;
    font-size: 20px;
  }`}
`;

export default CamelSellerEvent;
