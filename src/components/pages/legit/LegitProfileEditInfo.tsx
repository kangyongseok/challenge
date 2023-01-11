import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { Box, Button, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import UserAvatar from '@components/UI/organisms/UserAvatar';
import TextInput from '@components/UI/molecules/TextInput';

import { PhotoGuideImage } from '@dto/productLegit';

import { CAMEL_SUBSET_FONTFAMILY, extractTagRegx } from '@constants/common';

import {
  checkAgent,
  handleClickAppDownload,
  isNeedUpdateImageUploadAOSVersion,
  isNeedUpdateImageUploadIOSVersion
} from '@utils/common';

import { shake } from '@styles/transition';

import { legitProfileEditState } from '@recoil/legitProfile';
import { dialogState, toastState } from '@recoil/common';

interface LegitProfileEditInfoProps {
  userImageProfile: string;
}

function LegitProfileEditInfo({ userImageProfile }: LegitProfileEditInfoProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const nickNameRef = useRef<null | HTMLInputElement>(null);

  const setToastState = useSetRecoilState(toastState);
  const setDialogState = useSetRecoilState(dialogState);
  const [sellerEditInfo, setSellerEditInfo] = useRecoilState(legitProfileEditState);
  const [isBanWord, setIsBanWord] = useState(false);

  const [{ imageType, isLoadingGetPhoto }, setGetPhotoState] = useState<{
    imageType: 'profile' | 'background';
    isLoadingGetPhoto: boolean;
  }>({
    imageType: 'profile',
    isLoadingGetPhoto: false
  });

  const appUpdateDialogIOS = useCallback(() => {
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
  }, [setDialogState]);

  const appUpdateDialogAndroid = useCallback(() => {
    setDialogState({
      type: 'appUpdateNotice',
      customStyleTitle: { minWidth: 269 },
      secondButtonAction: () => {
        if (window.webview && window.webview.callExecuteApp)
          window.webview.callExecuteApp('market://details?id=kr.co.mrcamel.android');
      }
    });
  }, [setDialogState]);

  const appDownLoadDialog = useCallback(() => {
    setDialogState({
      type: 'featureIsMobileAppDown',
      customStyleTitle: { minWidth: 311 },
      secondButtonAction() {
        handleClickAppDownload({});
      }
    });
  }, [setDialogState]);

  const handleChangeImage = useCallback(
    ({ isBackground }: { isBackground: boolean }) =>
      () => {
        const isIOSbridgeCallPhoto =
          checkAgent.isIOSApp() &&
          window.webkit &&
          window.webkit.messageHandlers &&
          window.webkit.messageHandlers.callPhotoGuide;

        const isAndroidBridgeCallPhoto =
          checkAgent.isAndroidApp() && window.webview && window.webview.callPhotoGuide;

        if (isLoadingGetPhoto) return; // isLoadingMutate ||

        if (!checkAgent.isMobileApp()) {
          appDownLoadDialog();
          return;
        }

        if (isNeedUpdateImageUploadIOSVersion()) {
          appUpdateDialogIOS();
          return;
        }

        if (isNeedUpdateImageUploadAOSVersion()) {
          appUpdateDialogAndroid();
          return;
        }

        setGetPhotoState((prevState) => ({
          ...prevState,
          imageType: isBackground ? 'background' : 'profile'
        }));

        if (isIOSbridgeCallPhoto) {
          window.webkit.messageHandlers.callPhotoGuide.postMessage(
            JSON.stringify({
              guideId: isBackground ? 25 : 24,
              viewMode: 'ALBUM',
              type: 2,
              imageType: 4
            })
          );
        }

        if (isAndroidBridgeCallPhoto) {
          window.webview.callPhotoGuide(
            isBackground ? 25 : 24,
            JSON.stringify({
              viewMode: 'ALBUM',
              type: 2,
              imageType: 4
            })
          );
        }
      },
    [appDownLoadDialog, appUpdateDialogAndroid, appUpdateDialogIOS, isLoadingGetPhoto]
  );

  useEffect(() => {
    window.getPhotoGuide = () => {
      setGetPhotoState((prevState) => ({ ...prevState, isLoadingGetPhoto: true }));
    };

    window.getPhotoGuideDone = (photoGuideImagesData: PhotoGuideImage[]) => {
      const [firstPhotoGuideImage] = photoGuideImagesData;

      if (firstPhotoGuideImage) {
        switch (imageType) {
          case 'profile': {
            setSellerEditInfo({ ...sellerEditInfo, imageProfile: firstPhotoGuideImage.imageUrl });
            setToastState({ type: 'user', status: 'savedProfileImage' });
            break;
          }
          case 'background': {
            setSellerEditInfo({
              ...sellerEditInfo,
              imageBackground: firstPhotoGuideImage.imageUrl
            });
            setToastState({ type: 'user', status: 'savedBackgroundImage' });
            break;
          }
          default: {
            break;
          }
        }
      }

      setTimeout(
        () => setGetPhotoState((prevState) => ({ ...prevState, isLoadingGetPhoto: false })),
        500
      );
    };
  }, [imageType, sellerEditInfo, setSellerEditInfo, setToastState]);

  useEffect(() => {
    setIsBanWord(extractTagRegx.test(sellerEditInfo.nickName || ''));
  }, [sellerEditInfo.nickName]);

  const handleClickInput = () => {
    nickNameRef.current?.focus();
    setSellerEditInfo({
      ...sellerEditInfo,
      nickName: (sellerEditInfo.nickName || '').replace(extractTagRegx, '')
    });
    setIsBanWord(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;

    if (target.value.replace(/[^a-zA-Z\s+]/gi, '').length > 16) {
      setToastState({
        type: 'common',
        status: 'overLimitText',
        params: { length: 16 }
      });
      return;
    }

    setSellerEditInfo({
      ...sellerEditInfo,
      nickName: target.value.replace(/[^a-zA-Z\s+]/gi, '').substring(0, 16)
    });
  };

  return (
    <Wrap>
      <Flexbox justifyContent="space-between" alignment="center" gap={18}>
        <Box customStyle={{ width: '100%' }}>
          <Typography
            variant="h4"
            weight="bold"
            customStyle={{ color: common.uiWhite, marginBottom: 12 }}
          >
            닉네임
          </Typography>
          <TextAreaWrap>
            <NickNameInputWrap ban={isBanWord}>
              <TextInputArea
                ref={nickNameRef}
                ban={isBanWord}
                onChange={handleChange}
                value={(sellerEditInfo.nickName || '').replace(extractTagRegx, '')}
                type="search"
                placeholder="영어이름을 입력해주세요"
                customStyle={{ padding: 0, height: '100%' }}
              />
              <FakeTextInput
                ban={isBanWord}
                dangerouslySetInnerHTML={{ __html: sellerEditInfo.nickName || '' }}
                onClick={handleClickInput}
              />
            </NickNameInputWrap>
            <Flexbox
              justifyContent="space-between"
              alignment="center"
              customStyle={{ marginTop: 8 }}
            >
              <Typography
                variant="small2"
                weight="medium"
                customStyle={{ color: common.uiWhite, marginLeft: 12 }}
              >
                {(sellerEditInfo.nickName || '').replace(extractTagRegx, '').length}/16
              </Typography>
            </Flexbox>
          </TextAreaWrap>
        </Box>
        <Box
          customStyle={{ position: 'relative' }}
          onClick={handleChangeImage({ isBackground: false })}
        >
          <UserAvatar src={userImageProfile} isRound />
          <IconBox>
            <Icon name="CameraFilled" />
          </IconBox>
        </Box>
      </Flexbox>
      <Flexbox direction="vertical" gap={8} customStyle={{ zIndex: 1, marginTop: 33 }}>
        <Button
          startIcon={
            <Icon name={isLoadingGetPhoto ? 'LoadingFilled' : 'CameraFilled'} color="white" />
          }
          fullWidth
          onClick={handleChangeImage({ isBackground: true })}
          disabled={isLoadingGetPhoto} // isLoadingMutate
          customStyle={{ background: 'none', color: common.uiWhite }}
        >
          배경 사진 변경
        </Button>
      </Flexbox>
    </Wrap>
  );
}

const Wrap = styled.div`
  position: relative;
  z-index: 1;
  height: calc(305px - 87px);
  padding-top: 30px;
`;

const IconBox = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  display: inline-flex;
  justify-content: center;
  background-color: ${({ theme }) => theme.palette.common.cmnW};
  border: 1px solid ${({ theme }) => theme.palette.common.line01};
  border-radius: 100%;
  padding: 7px;
`;

const TextAreaWrap = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const NickNameInputWrap = styled.div<{ ban: boolean }>`
  height: 44px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  border: 1px solid
    ${({
      theme: {
        palette: { common, secondary }
      },
      ban
    }) => (ban ? secondary.red.light : common.line01)};
  ${({ ban }): CSSObject => {
    if (ban) {
      return {
        outline: 0,
        animationName: shake,
        animationDuration: '0.5s',
        animationDelay: '0.25s'
      };
    }
    return {};
  }}
`;

const TextInputArea = styled(TextInput)<{ ban: boolean }>`
  font-family: ${CAMEL_SUBSET_FONTFAMILY};
  height: 100%;
  width: 100%;
  padding: 14px;
  position: relative;
  font-weight: ${({ theme: { typography } }) => typography.h4.weight.regular};
  font-size: ${({ theme: { typography } }) => typography.h4.size};
  z-index: 1;
`;

const FakeTextInput = styled.div<{ ban: boolean }>`
  font-family: ${CAMEL_SUBSET_FONTFAMILY};
  width: 100%;
  height: 44px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  letter-spacing: -0.2px;
  position: absolute;
  display: flex;
  z-index: ${({ ban }) => (ban ? 2 : 0)};
  align-items: center;
  top: -1px;
  left: 0;
  padding-left: 14px;
  font-weight: ${({ theme: { typography } }) => typography.h4.weight.regular};
  font-size: ${({ theme: { typography } }) => typography.h4.size};
  b {
    font-weight: ${({ theme: { typography } }) => typography.h4.weight.regular};
    font-size: ${({ theme: { typography } }) => typography.h4.size};
    color: ${({
      theme: {
        palette: { secondary }
      }
    }) => secondary.red.light};
  }
  color: ${({
    ban,
    theme: {
      palette: { common }
    }
  }) => (ban ? common.ui20 : 'transparent')};
`;

export default LegitProfileEditInfo;
