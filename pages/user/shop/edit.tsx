import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState } from 'recoil';
import TextareaAutosize from 'react-textarea-autosize';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast, { useToastStack } from '@mrcamelhub/camel-ui-toast';
import {
  Box,
  Button,
  Flexbox,
  Icon,
  Skeleton,
  ThemeProvider,
  Typography,
  useTheme
} from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import {
  AppUpdateNoticeDialog,
  FeatureIsMobileAppDownDialog,
  LeaveEditProfileDialog,
  UserAvatar,
  UserWithdrawalDialog
} from '@components/UI/organisms';
import { Header, TextInput } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import type { BanWordParams, UpdateUserProfileData } from '@dto/user';

import LocalStorage from '@library/localStorage';
import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchBanword, fetchInfoByUserId, putProfile } from '@api/user';

import { PROFILE_EDIT_ERROR_MESSAGE } from '@constants/user';
import queryKeys from '@constants/queryKeys';
import { ACCESS_USER } from '@constants/localStorage';
import { DEFAUT_BACKGROUND_IMAGE, HEADER_HEIGHT, IOS_SAFE_AREA_TOP } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getUserName } from '@utils/user';
import { getCookies } from '@utils/cookies';
import getAccessUserByCookies from '@utils/common/getAccessUserByCookies';
import {
  checkAgent,
  getImagePathStaticParser,
  getImageResizePath,
  hasImageFile,
  isExtendedLayoutIOSVersion,
  isNeedUpdateImageUploadAOSVersion,
  isNeedUpdateImageUploadIOSVersion
} from '@utils/common';

import { shake } from '@styles/transition';

import { userShopUpdatedProfileDataState } from '@recoil/userShop';
import useSession from '@hooks/useSession';
import useScrollTrigger from '@hooks/useScrollTrigger';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';
import useMutationDeleteAccount from '@hooks/useMutationDeleteAccount';
import useGetImage from '@hooks/useGetImage';

function UserShopEdit() {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const toastStack = useToastStack();

  const queryClient = useQueryClient();

  const [userShopUpdatedProfileData, setUserShopUpdatedProfileDataState] = useRecoilState(
    userShopUpdatedProfileDataState
  );

  const { isLoggedInWithSMS, data: accessUser } = useSession();
  const { data: myUserInfo, userId, userNickName } = useQueryMyUserInfo();
  const { data: { name, nickName, image, imageProfile, imageBackground, shopDescription } = {} } =
    useQuery(
      queryKeys.users.infoByUserId(accessUser?.userId || 0),
      () => fetchInfoByUserId(accessUser?.userId || 0),
      {
        enabled: isLoggedInWithSMS,
        refetchOnMount: true
      }
    );

  const { mutate: mutateBanWord, isLoading: isLoadingMutateBanWord } = useMutation(fetchBanword);
  const { mutate: mutateProfile, isLoading: isLoadingMutateProfile } = useMutation(putProfile, {
    async onSuccess() {
      LocalStorage.set(ACCESS_USER, {
        ...accessUser,
        userName: userProfileParams.nickName,
        image: userProfileParams.imageProfile || accessUser?.image || ''
      });
      await queryClient.invalidateQueries(queryKeys.users.userInfo());
      await queryClient.invalidateQueries(queryKeys.users.myUserInfo());
      await queryClient.invalidateQueries({
        queryKey: queryKeys.users.infoByUserId(accessUser?.userId || 0),
        refetchType: 'inactive'
      });
      toastStack({
        children: '저장을 완료했어요.'
      });
      setUserShopUpdatedProfileDataState(false);
      router.back();
    }
  });
  const { mutate: mutateWitdhdraw } = useMutationDeleteAccount();

  const [userProfileParams, setUserProfileParams] = useState<UpdateUserProfileData>({
    nickName: '',
    shopDescription: ''
  });
  const [{ nickNameError, descriptionError }, setError] = useState({
    nickNameError: {
      message: '',
      text: ''
    },
    descriptionError: {
      message: '',
      text: ''
    }
  });
  const [open, setOpen] = useState(false);
  const [openNicknameToast, setOpenNicknameToast] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openFeatureInAppDialog, setOpenFeatureInAppDialog] = useState(false);
  const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
  const [openIOSNoticeDialog, setOpenIOSNoticeDialog] = useState(false);
  const [openAOSNoticeDialog, setOpenAOSNoticeDialog] = useState(false);

  const nickNameRef = useRef<null | HTMLInputElement>(null);
  const descriptionRef = useRef<null | HTMLTextAreaElement>(null);
  const infoRef = useRef<null | HTMLDivElement>(null);
  const triggered = useScrollTrigger({
    ref: infoRef,
    additionalOffsetTop:
      -(isExtendedLayoutIOSVersion()
        ? Number(
            getComputedStyle(document.documentElement).getPropertyValue('--sat').split('px')[0]
          )
        : 0) - HEADER_HEIGHT,
    delay: 0
  });
  const { imageType, isLoadingGetPhoto, setGetPhotoState } = useGetImage((imageUrl) => {
    switch (imageType) {
      case 'profile': {
        toastStack({
          children: '프로필 사진을 저장했어요.'
        });
        setUserProfileParams((prevState) => ({ ...prevState, imageProfile: imageUrl }));
        break;
      }
      case 'background': {
        toastStack({
          children: '배경 사진을 저장했어요.'
        });
        setUserProfileParams((prevState) => ({ ...prevState, imageBackground: imageUrl }));
        break;
      }
      default: {
        break;
      }
    }
  });

  const isUpdatedProfileData = useMemo(() => {
    if (
      !!userProfileParams.nickName?.length &&
      (nickName || name || userNickName) !== userProfileParams.nickName
    )
      return true;

    if (
      !!userProfileParams.imageProfile?.length &&
      (imageProfile || image) !== userProfileParams.imageProfile
    )
      return true;

    if (
      !!userProfileParams.imageBackground?.length &&
      imageBackground !== userProfileParams.imageBackground
    )
      return true;

    if (
      !!userProfileParams.shopDescription &&
      shopDescription !== userProfileParams.shopDescription
    )
      return true;

    return false;
  }, [
    image,
    imageBackground,
    imageProfile,
    name,
    nickName,
    shopDescription,
    userNickName,
    userProfileParams.imageBackground,
    userProfileParams.imageProfile,
    userProfileParams.nickName,
    userProfileParams.shopDescription
  ]);
  const userImageProfile =
    (hasImageFile(userProfileParams?.imageProfile) && userProfileParams?.imageProfile) ||
    (hasImageFile(myUserInfo?.info?.value?.image) && myUserInfo?.info?.value?.image) ||
    '';
  const userImageBackground =
    userProfileParams.imageBackground ||
    (userImageProfile.length > 0 && userImageProfile) ||
    DEFAUT_BACKGROUND_IMAGE;

  const handleChangeImage = useCallback(
    (isBackground: boolean) => () => {
      if (isLoadingMutateBanWord || isLoadingMutateProfile || isLoadingGetPhoto) return;

      logEvent(
        isBackground ? attrKeys.userShop.CLICK_BG_EDIT : attrKeys.userShop.CLICK_PROFILE_PHOTO_EDIT,
        {
          att: 'SELLER'
        }
      );

      if (!checkAgent.isMobileApp()) {
        setOpenFeatureInAppDialog(true);
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

      logEvent(attrKeys.userShop.VIEW_PROFILE_CAMERA, {
        att: isBackground ? 'BG' : 'PROFILE_PHOTO'
      });
      setGetPhotoState((prevState) => ({
        ...prevState,
        imageType: isBackground ? 'background' : 'profile'
      }));

      if (checkAgent.isIOSApp()) {
        window.webkit?.messageHandlers?.callPhotoGuide?.postMessage?.(
          JSON.stringify({
            guideId: isBackground ? 25 : 24,
            viewMode: 'ALBUM',
            type: 2,
            imageType: 4
          })
        );
      }

      if (checkAgent.isAndroidApp()) {
        window.webview?.callPhotoGuide?.(
          isBackground ? 25 : 24,
          JSON.stringify({
            viewMode: 'ALBUM',
            type: 2,
            imageType: 4
          })
        );
      }
    },
    [isLoadingGetPhoto, isLoadingMutateBanWord, isLoadingMutateProfile, setGetPhotoState]
  );

  const handleChangeNickName = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (nickNameError.text.length > 0)
        setError((prevState) => ({ ...prevState, nickNameError: { message: '', text: '' } }));

      if (e.target.value.length > 16) {
        setOpenNicknameToast(true);
      } else {
        setUserProfileParams((prevState) => ({
          ...prevState,
          nickName: prevState.nickName?.length
            ? e.target.value.replace(/[^ㄱ-ㅎ|가-힣|a-z|A-Z\s+]/gi, '')
            : e.target.value.replace(/[^ㄱ-ㅎ|가-힣|a-z|A-Z\s+]/gi, '').trim()
        }));
      }
    },
    [nickNameError.text.length]
  );

  const handleChangeDescription = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      if (descriptionError.text.length > 0)
        setError((prevState) => ({ ...prevState, descriptionError: { message: '', text: '' } }));

      if (e.target.value.length > 100) {
        setOpen(true);
      } else {
        setUserProfileParams((prevState) => ({
          ...prevState,
          shopDescription: prevState.shopDescription?.length
            ? e.target.value
            : e.target.value.trim()
        }));
      }
    },
    [descriptionError.text.length]
  );

  const handleClickSave = useCallback(() => {
    if (
      isLoadingMutateBanWord ||
      isLoadingMutateProfile ||
      isLoadingGetPhoto ||
      !userProfileParams.nickName?.length ||
      !isUpdatedProfileData ||
      nickNameError.message.length > 0 ||
      descriptionError.message.length > 0
    )
      return;

    logEvent(attrKeys.userShop.SUBMIT_PROFILE, { att: 'SELLER' });

    const banwordParams: BanWordParams = {};

    if ((nickName || name || userNickName) !== userProfileParams.nickName) {
      banwordParams.nickName = userProfileParams.nickName;
    }

    if (userProfileParams.shopDescription?.length) {
      banwordParams.shopDescription = userProfileParams.shopDescription;
    }

    mutateBanWord(banwordParams, {
      onSuccess({ invalidReasons }) {
        if (invalidReasons) {
          invalidReasons.forEach(({ param, type, result }) => {
            if (param === 'NICKNAME' && type !== 'DUPLICATE') {
              setError((prevState) => ({
                ...prevState,
                nickNameError: {
                  message: PROFILE_EDIT_ERROR_MESSAGE[type],
                  text: result
                }
              }));
            }

            if (param === 'SHOPDESCRIPTION' && type !== 'DUPLICATE')
              setError((prevState) => ({
                ...prevState,
                descriptionError: {
                  message: PROFILE_EDIT_ERROR_MESSAGE[type],
                  text: result
                    .replace(/ /g, '&nbsp;')
                    .replace(/\r?\n/g, '<br />')
                    .replace(/<b>/g, '<div/><b>')
                    .replace(/<\/b>/g, '</b><div>')
                }
              }));
          });

          if (invalidReasons.some(({ type }) => type === 'DUPLICATE')) {
            toastStack({
              children: '이미 사용 중인 닉네임이에요.'
            });
          } else if (invalidReasons.some(({ type }) => type === 'ADMIN')) {
            toastStack({
              children: '관리자로 오해할 수 있는 단어는 쓸 수 없어요.'
            });
          } else if (invalidReasons.some(({ type }) => type === 'BAN')) {
            toastStack({
              children: '욕설 및 비속어는 사용할 수 없어요!'
            });
          }
        } else {
          mutateProfile(userProfileParams);
        }
      }
    });
  }, [
    descriptionError.message.length,
    isLoadingGetPhoto,
    isLoadingMutateBanWord,
    isLoadingMutateProfile,
    isUpdatedProfileData,
    mutateBanWord,
    mutateProfile,
    name,
    nickName,
    nickNameError.message.length,
    userNickName,
    userProfileParams,
    toastStack
  ]);

  const handleClickDeleteAccount = useCallback(() => setOpenDialog(true), []);

  useEffect(() => {
    logEvent(attrKeys.userShop.VIEW_PROFILE_EDIT, {
      att: 'SELLER'
    });
  }, []);

  useEffect(() => {
    setUserProfileParams({
      nickName: getUserName(nickName || name, userId),
      imageProfile: imageProfile || image,
      imageBackground: imageBackground || '',
      shopDescription: shopDescription || ''
    });
  }, [image, imageBackground, imageProfile, name, nickName, shopDescription, userId]);

  useEffect(() => {
    setUserShopUpdatedProfileDataState(isUpdatedProfileData);
  }, [isUpdatedProfileData, setUserShopUpdatedProfileDataState]);

  useEffect(() => {
    router.beforePopState(() => {
      if (userShopUpdatedProfileData) {
        setOpenLeaveDialog(true);
        return false;
      }
      return true;
    });
  }, [router, userShopUpdatedProfileData]);

  const handleClickBack = () => {
    logEvent(attrKeys.header.CLICK_BACK, {
      name: attrProperty.name.USER_SHOP_EDIT
    });
    if (userShopUpdatedProfileData) {
      window.history.pushState('', '', router.asPath);
    }
    router.back();
  };

  return (
    <>
      <GeneralTemplate
        header={
          <ThemeProvider theme={triggered ? 'light' : 'dark'}>
            <Header
              isTransparent={!triggered}
              titleCustomStyle={{ color: common.cmnW }}
              showRight={false}
              onClickLeft={handleClickBack}
            >
              <Typography variant="h3" weight="bold">
                프로필 수정
              </Typography>
            </Header>
          </ThemeProvider>
        }
        disablePadding
      >
        <Flexbox
          direction="vertical"
          customStyle={{
            userSelect: 'none',
            height: '100%'
          }}
        >
          <ImageWrapper>
            <BackgroundImage
              src={getImageResizePath({
                imagePath: getImagePathStaticParser(userImageBackground),
                h: 160
              })}
            >
              <Blur />
            </BackgroundImage>
            <BackgroundImageIcon onClick={handleChangeImage(true)}>
              <Icon name="CameraFilled" size="medium" />
            </BackgroundImageIcon>
          </ImageWrapper>
          <InfoWrapper ref={infoRef}>
            <Box
              customStyle={{ position: 'relative', margin: '-40px auto 0' }}
              onClick={handleChangeImage(false)}
            >
              {isLoadingGetPhoto && imageType === 'profile' ? (
                <Skeleton width={96} height={96} disableAspectRatio round={16} />
              ) : (
                <UserAvatar src={userImageProfile} showBorder />
              )}
              <ProfileImageIcon>
                <Icon name="CameraFilled" size="medium" />
              </ProfileImageIcon>
            </Box>
            <Flexbox direction="vertical" gap={32} customStyle={{ marginTop: 52 }}>
              <Flexbox direction="vertical" gap={12}>
                <Typography weight="bold" customStyle={{ color: common.ui80 }}>
                  닉네임
                </Typography>
                <Flexbox direction="vertical" gap={8}>
                  <TextInput
                    ref={nickNameRef}
                    wrapperClassName={nickNameError.text.length > 0 ? 'invalid' : ''}
                    type="search"
                    placeholder="닉네임을 입력해주세요"
                    value={userProfileParams.nickName}
                    onClick={() =>
                      logEvent(attrKeys.userShop.CLICK_NICKNAME_EDIT, {
                        att: 'SELLER'
                      })
                    }
                    onChange={handleChangeNickName}
                    customStyle={{
                      padding: 12,
                      height: 52,
                      borderRadius: 8,
                      border: `1px solid ${common.line01}`
                    }}
                    inputStyle={{
                      height: 24,
                      width: '100%',
                      color: nickNameError.text.length > 0 ? 'transparent' : undefined,
                      caretColor: common.ui20
                    }}
                    label={
                      <NickNameErrorLabel
                        variant="h3"
                        dangerouslySetInnerHTML={{ __html: nickNameError.text }}
                        onClick={() => nickNameRef.current?.focus()}
                      />
                    }
                  />
                  <NickNameLabel
                    variant="small2"
                    weight="medium"
                    invalid={nickNameError.message.length > 0}
                  >
                    {nickNameError.message || `${userProfileParams.nickName?.length || 0}/16`}
                  </NickNameLabel>
                </Flexbox>
              </Flexbox>
              <Flexbox direction="vertical" gap={12}>
                <Typography weight="bold" customStyle={{ color: common.ui80 }}>
                  내 상점 소개
                </Typography>
                <Description>
                  <DescriptionErrorLabel
                    variant="h4"
                    onClick={() => descriptionRef.current?.focus()}
                  >
                    {descriptionError.text
                      .split(/<\/?div[^>]*>/g)
                      .filter((t) => t)
                      .map(
                        (t) =>
                          (t.startsWith('<b>') && <b>{t.replace(/<\/?b[^>]*>/g, '')}</b>) || (
                            <span
                              key={`description-${t}`}
                              dangerouslySetInnerHTML={{ __html: t }}
                            />
                          )
                      )}
                  </DescriptionErrorLabel>
                  <TextareaAutosize
                    ref={descriptionRef}
                    className={descriptionError.text.length > 0 ? 'invalid' : ''}
                    placeholder="상점 소개를 입력해주세요"
                    value={userProfileParams.shopDescription}
                    onClick={() =>
                      logEvent(attrKeys.userShop.CLICK_STORE_EDIT, {
                        att: 'SELLER'
                      })
                    }
                    onChange={handleChangeDescription}
                  />
                  <DescriptionInfo variant="small2" weight="medium">
                    {userProfileParams.shopDescription?.length || 0}
                    <span>/ 100자</span>
                  </DescriptionInfo>
                  {descriptionError.message.length > 0 && (
                    <ErrorLabel variant="small2" weight="medium">
                      {descriptionError.message}
                    </ErrorLabel>
                  )}
                </Description>
              </Flexbox>
            </Flexbox>
          </InfoWrapper>
          <Flexbox
            component="section"
            justifyContent="center"
            customStyle={{ padding: '0 20px 92px', userSelect: 'none', marginTop: 'auto' }}
          >
            <Typography
              variant="body2"
              customStyle={{
                textDecorationLine: 'underline',
                color: common.ui60,
                cursor: 'pointer'
              }}
              onClick={handleClickDeleteAccount}
            >
              회원탈퇴
            </Typography>
          </Flexbox>
          <ButtonBox>
            <Button
              type="submit"
              size="xlarge"
              variant="solid"
              brandColor="primary"
              fullWidth
              disabled={
                isLoadingMutateBanWord ||
                isLoadingMutateProfile ||
                isLoadingGetPhoto ||
                !userProfileParams.nickName?.length ||
                !isUpdatedProfileData ||
                nickNameError.message.length > 0 ||
                descriptionError.message.length > 0
              }
              onClick={handleClickSave}
            >
              {isLoadingMutateBanWord || isLoadingMutateProfile ? (
                <Icon name="LoadingFilled" />
              ) : (
                '저장'
              )}
            </Button>
          </ButtonBox>
        </Flexbox>
      </GeneralTemplate>
      <Toast open={open} onClose={() => setOpen(false)}>
        100글자만 입력할 수 있어요.
      </Toast>
      <Toast open={openNicknameToast} onClose={() => setOpenNicknameToast(false)}>
        16글자만 입력할 수 있어요.
      </Toast>
      <LeaveEditProfileDialog
        open={openLeaveDialog}
        onClose={() => setOpenLeaveDialog(false)}
        onClick={() => {
          setUserShopUpdatedProfileDataState(false);
          router.back();
        }}
      />
      <UserWithdrawalDialog
        open={openDialog}
        onClose={() => {
          logEvent(attrKeys.mypage.SELECT_WITHDRAW, {
            att: 'NO'
          });
          setOpenDialog(false);
        }}
        onClick={() => {
          logEvent(attrKeys.mypage.SELECT_WITHDRAW, {
            att: 'YES'
          });
          mutateWitdhdraw();
        }}
      />
      <FeatureIsMobileAppDownDialog
        open={openFeatureInAppDialog}
        onClose={() => setOpenFeatureInAppDialog(false)}
      />
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
    </>
  );
}

const ImageWrapper = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: calc(${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'} + 160px);
  margin-top: calc(
    -${HEADER_HEIGHT}px - ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'}
  );
`;

const BackgroundImage = styled.div<{ src: string }>`
  position: absolute;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-image: url(${({ src }) => src});
`;

const Blur = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  position: absolute;
  background: ${({ theme: { palette } }) => palette.common.overlay20};
  backdrop-filter: blur(8px);
`;

const IconBase = styled.div`
  position: absolute;
  width: 36px;
  height: 36px;
  display: inline-flex;
  justify-content: center;
  background-color: ${({ theme }) => theme.palette.common.cmnW};
  border: 1px solid ${({ theme }) => theme.palette.common.line01};
  border-radius: 100%;
  padding: 8px;
  cursor: pointer;
`;

const BackgroundImageIcon = styled(IconBase)`
  left: 20px;
  bottom: 12px;
`;

const InfoWrapper = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  padding: 0 20px 52px;

  .invalid {
    outline: 0;
    border-color: ${({ theme: { palette } }) => palette.secondary.red.light};
    animation-name: ${shake};
    animation-duration: 0.5s;
    animation-delay: 0.25s;
  }
`;

const ProfileImageIcon = styled(IconBase)`
  right: -12px;
  transform: translateY(-100%);
`;

const NickNameLabel = styled(Typography)<{ invalid: boolean }>`
  color: ${({ theme: { palette }, invalid }) =>
    invalid ? palette.secondary.red.light : palette.common.ui60};
  margin-left: 12px;
`;

const NickNameErrorLabel = styled(Typography)`
  white-space: nowrap;
  overflow: hidden;
  position: absolute;
  left: 12px;
  line-height: 20px;

  & > b {
    color: ${({ theme: { palette } }) => palette.secondary.red.light};
  }
`;

const DescriptionErrorLabel = styled(Typography)`
  position: absolute;
  top: 13px;
  right: 13px;
  bottom: 13px;
  left: 13px;
  width: calc(100% - 25px);

  & > b {
    color: ${({ theme: { palette } }) => palette.secondary.red.light};
  }
`;

const Description = styled.div`
  position: relative;
  display: flex;
  transition-delay: 0.5s;

  textarea {
    min-height: 296px;
    width: 100%;
    background-color: ${({ theme: { palette } }) => palette.common.bg01};
    border: 1px solid ${({ theme: { palette } }) => palette.common.line01};
    border-radius: 8px;
    padding: 12px 12px 24px;
    resize: none;
    color: ${({ theme: { palette } }) => palette.common.ui20};
    caret-color: ${({ theme: { palette } }) => palette.common.ui20};

    ${({ theme: { typography } }) => ({
      fontSize: typography.h4.size,
      fontWeight: typography.h4.weight.regular,
      lineHeight: typography.h4.lineHeight,
      letterSpacing: typography.h4.letterSpacing
    })};

    ::placeholder {
      color: ${({ theme: { palette } }) => palette.common.ui80};
      white-space: pre-wrap;
    }
  }
`;

const DescriptionInfo = styled(Typography)`
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: inline-flex;
  color: ${({ theme: { palette } }) => palette.common.ui60};

  span {
    margin-left: 4px;
    color: ${({ theme: { palette } }) => palette.common.ui80};
  }
`;

const ButtonBox = styled.div`
  position: fixed;
  width: 100%;
  bottom: 0;
  padding: 20px;
  background-color: ${({ theme }) => theme.palette.common.uiWhite};
  z-index: ${({ theme: { zIndex } }) => zIndex.button};
`;

const ErrorLabel = styled(Typography)`
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: inline-flex;
  color: ${({ theme: { palette } }) => palette.secondary.red.light};
`;

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  Initializer.initAccessTokenByCookies(getCookies({ req }));

  return {
    props: {
      accessUser: getAccessUserByCookies(getCookies({ req }))
    }
  };
}

export default UserShopEdit;
