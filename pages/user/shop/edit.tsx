import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useSetRecoilState } from 'recoil';
import TextareaAutosize from 'react-textarea-autosize';
import { QueryClient, dehydrate, useMutation, useQuery, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import Image from 'next/image';
import type { GetServerSidePropsContext } from 'next';
import {
  Box,
  Button,
  Flexbox,
  Icon,
  Skeleton,
  ThemeProvider,
  Typography,
  useTheme
} from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Header, TextInput } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import type { UpdateUserProfileData } from '@dto/user';
import { BanWordParams } from '@dto/user';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchBanword, fetchInfoByUserId, putProfile } from '@api/user';

import { PROFILE_EDIT_ERROR_MESSAGE } from '@constants/user';
import queryKeys from '@constants/queryKeys';
import {
  APP_TOP_STATUS_HEIGHT,
  CAMEL_SUBSET_FONTFAMILY,
  HEADER_HEIGHT,
  NEXT_IMAGE_BLUR_URL
} from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';
import {
  checkAgent,
  handleClickAppDownload,
  isExtendedLayoutIOSVersion,
  isNeedUpdateImageUploadAOSVersion,
  isNeedUpdateImageUploadIOSVersion
} from '@utils/common';

import { shake } from '@styles/transition';

import { dialogState, toastState } from '@recoil/common';
import useScrollTrigger from '@hooks/useScrollTrigger';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useMutationDeleteAccount from '@hooks/useMutationDeleteAccount';
import useGetImage from '@hooks/useGetImage';

function UserShopEdit() {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const queryClient = useQueryClient();
  const setDialogState = useSetRecoilState(dialogState);
  const setToastState = useSetRecoilState(toastState);
  const [imageRendered, setImageRendered] = useState(false);
  const { data: myUserInfo } = useQueryMyUserInfo();

  const { data: accessUser } = useQueryAccessUser();
  const {
    data: { name, nickName, image, imageProfile, imageBackground, shopDescription } = {},
    refetch: refetchInfoByUserId
  } = useQuery(
    queryKeys.users.infoByUserId(accessUser?.userId || 0),
    () => fetchInfoByUserId(accessUser?.userId || 0),
    {
      enabled: !!accessUser?.userId
    }
  );

  const { mutate: mutateBanWord, isLoading: isLoadingMutateBanWord } = useMutation(fetchBanword);
  const { mutate: mutateProfile, isLoading: isLoadingMutateProfile } = useMutation(putProfile, {
    async onSuccess() {
      await queryClient.invalidateQueries(queryKeys.users.userInfo());
      await queryClient.invalidateQueries(queryKeys.users.myUserInfo());
      await queryClient.invalidateQueries(queryKeys.users.infoByUserId(accessUser?.userId || 0), {
        refetchInactive: true
      });
      await refetchInfoByUserId();
      setToastState({ type: 'user', status: 'saved' });
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

  const nickNameRef = useRef<null | HTMLInputElement>(null);
  const descriptionRef = useRef<null | HTMLTextAreaElement>(null);
  const infoRef = useRef<null | HTMLDivElement>(null);
  const triggered = useScrollTrigger({
    ref: infoRef,
    additionalOffsetTop:
      (isExtendedLayoutIOSVersion() ? -APP_TOP_STATUS_HEIGHT : 0) + -HEADER_HEIGHT,
    delay: 0
  });
  const { imageType, isLoadingGetPhoto, setGetPhotoState } = useGetImage((imageUrl) => {
    switch (imageType) {
      case 'profile': {
        setUserProfileParams((prevState) => ({ ...prevState, imageProfile: imageUrl }));
        setToastState({ type: 'user', status: 'savedProfileImage' });
        break;
      }
      case 'background': {
        setUserProfileParams((prevState) => ({ ...prevState, imageBackground: imageUrl }));
        setToastState({ type: 'user', status: 'savedBackgroundImage' });
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
      (nickName || name || `${accessUser?.userId || '회원'}`) !== userProfileParams.nickName
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
    accessUser?.userId,
    image,
    imageBackground,
    imageProfile,
    name,
    nickName,
    shopDescription,
    userProfileParams.imageBackground,
    userProfileParams.imageProfile,
    userProfileParams.nickName,
    userProfileParams.shopDescription
  ]);

  const handleClickBack = useCallback(() => {
    if (isUpdatedProfileData) {
      setDialogState({
        type: 'leaveEditProfile',
        secondButtonAction() {
          router.back();
        },
        customStyleTitle: { minWidth: 270 }
      });
    } else {
      router.back();
    }
  }, [isUpdatedProfileData, router, setDialogState]);

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
    (isBackground: boolean) => () => {
      if (isLoadingMutateBanWord || isLoadingMutateProfile || isLoadingGetPhoto) return;

      if (!checkAgent.isMobileApp()) {
        appDownLoadDialog();
        return;
      }

      if (isNeedUpdateImageUploadIOSVersion()) {
        setDialogState({
          type: 'appUpdateNotice',
          customStyleTitle: { minWidth: 269 },
          secondButtonAction: () => {
            window.webkit?.messageHandlers?.callExecuteApp?.postMessage?.(
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
            window.webview?.callExecuteApp?.('market://details?id=kr.co.mrcamel.android');
          }
        });
        return;
      }

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
    [
      appDownLoadDialog,
      isLoadingGetPhoto,
      isLoadingMutateBanWord,
      isLoadingMutateProfile,
      setDialogState,
      setGetPhotoState
    ]
  );

  const handleChangeNickName = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (nickNameError.text.length > 0)
        setError((prevState) => ({ ...prevState, nickNameError: { message: '', text: '' } }));

      if (e.target.value.length > 16) {
        setToastState({ type: 'common', status: 'overLimitText', params: { length: 16 } });
      } else {
        setUserProfileParams((prevState) => ({
          ...prevState,
          nickName: prevState.nickName?.length
            ? e.target.value.replace(/[^ㄱ-ㅎ|가-힣|a-z|A-Z\s+]/gi, '')
            : e.target.value.replace(/[^ㄱ-ㅎ|가-힣|a-z|A-Z\s+]/gi, '').trim()
        }));
      }
    },
    [nickNameError.text.length, setToastState]
  );

  const handleChangeDescription = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      if (descriptionError.text.length > 0)
        setError((prevState) => ({ ...prevState, descriptionError: { message: '', text: '' } }));

      if (e.target.value.length > 100) {
        setToastState({ type: 'common', status: 'overLimitText', params: { length: 100 } });
      } else {
        setUserProfileParams((prevState) => ({
          ...prevState,
          shopDescription: prevState.shopDescription?.length
            ? e.target.value
            : e.target.value.trim()
        }));
      }
    },
    [descriptionError.text.length, setToastState]
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

    const banwordParams: BanWordParams = {};

    if ((nickName || name || `${accessUser?.userId || '회원'}`) !== userProfileParams.nickName) {
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
                    .replaceAll(' ', '&nbsp;')
                    .replaceAll(/\r?\n/gi, '<br />')
                    .replaceAll('<b>', '<div/><b>')
                    .replaceAll('</b>', '</b><div>')
                }
              }));
          });

          if (invalidReasons.some(({ type }) => type === 'DUPLICATE')) {
            setToastState({ type: 'user', status: 'duplicatedNickName' });
          } else if (invalidReasons.some(({ type }) => type === 'ADMIN')) {
            setToastState({ type: 'user', status: 'invalidAdminWord' });
          } else if (invalidReasons.some(({ type }) => type === 'BAN')) {
            setToastState({ type: 'user', status: 'invalidBanWord' });
          }
        } else {
          mutateProfile(userProfileParams);
        }
      }
    });
  }, [
    accessUser?.userId,
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
    setToastState,
    userProfileParams
  ]);

  const handleClickDeleteAccount = useCallback(() => {
    setDialogState({
      type: 'deleteAccount',
      content: (
        <Typography
          weight="medium"
          customStyle={{ textAlign: 'center', padding: '12px 0', minWidth: 270 }}
        >
          지금까지 쌓아놓은 검색 이력과 찜 리스트,
          <br />
          맞춤 추천을 위한 정보가 모두 삭제됩니다.
          <br />
          그래도 회원탈퇴 하시겠어요?
        </Typography>
      ),
      firstButtonAction() {
        logEvent(attrKeys.mypage.SELECT_WITHDRAW, {
          att: 'YES'
        });
        mutateWitdhdraw();
      },
      secondButtonAction() {
        logEvent(attrKeys.mypage.SELECT_WITHDRAW, {
          att: 'NO'
        });
      }
    });
  }, [mutateWitdhdraw, setDialogState]);

  useEffect(() => {
    setUserProfileParams({
      nickName: nickName || name || `${accessUser?.userId || '회원'}`,
      imageProfile: imageProfile || image,
      imageBackground: imageBackground || '',
      shopDescription: shopDescription || ''
    });
  }, [accessUser?.userId, image, imageBackground, imageProfile, name, nickName, shopDescription]);

  const getProfileImage = useMemo(() => {
    const initDefaultImage = userProfileParams.imageProfile?.split('/').includes('0.png');
    const snsImage = myUserInfo?.info.value.image;
    if (initDefaultImage && snsImage) return snsImage;
    if (!initDefaultImage && userProfileParams.imageProfile) return userProfileParams.imageProfile;
    return '';
  }, [myUserInfo?.info.value.image, userProfileParams.imageProfile]);

  const handleLoadComplete = () => {
    setImageRendered(true);
  };

  return (
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
          paddingTop: isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0,
          userSelect: 'none',
          height: '100%'
        }}
      >
        <ImageWrapper>
          <BackgroundImage
            src={
              userProfileParams.imageBackground ||
              userProfileParams.imageProfile ||
              `https://${process.env.IMAGE_DOMAIN}/assets/images/user/shop/profile-background.png`
            }
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
              <ProfileImageWrap justifyContent="center" alignment="center">
                {getProfileImage && (
                  <Image
                    src={getProfileImage}
                    alt="Profile"
                    onLoadingComplete={handleLoadComplete}
                    placeholder="blur"
                    blurDataURL={NEXT_IMAGE_BLUR_URL}
                    layout="fill"
                    objectFit="cover"
                    style={{ borderRadius: 16 }}
                  />
                )}
                {(!imageRendered || !getProfileImage) && (
                  <Icon
                    name="UserFilled"
                    width={50}
                    height={50}
                    customStyle={{ color: common.ui80 }}
                  />
                )}
              </ProfileImageWrap>
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
                <DescriptionErrorLabel variant="h4" onClick={() => descriptionRef.current?.focus()}>
                  {descriptionError.text
                    .split(/<\/?div[^>]*>/g)
                    .filter((t) => t)
                    .map(
                      (t) =>
                        (t.startsWith('<b>') && <b>{t.replaceAll(/<\/?b[^>]*>/gi, '')}</b>) || (
                          <span dangerouslySetInnerHTML={{ __html: t }} />
                        )
                    )}
                </DescriptionErrorLabel>
                <TextareaAutosize
                  ref={descriptionRef}
                  className={descriptionError.text.length > 0 ? 'invalid' : ''}
                  placeholder="상점 소개를 입력해주세요"
                  value={userProfileParams.shopDescription}
                  onChange={handleChangeDescription}
                  style={{ fontFamily: CAMEL_SUBSET_FONTFAMILY }}
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
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const queryClient = new QueryClient();

  Initializer.initAccessTokenByCookies(getCookies({ req }));
  const accessUser = Initializer.initAccessUserInQueryClientByCookies(
    getCookies({ req }),
    queryClient
  );

  if (!accessUser) {
    return {
      redirect: {
        destination: '/login?returnUrl=/user/shop/edit&isRequiredLogin=true',
        permanent: false
      }
    };
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

const ImageWrapper = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 160px;
  padding-top: ${isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0}px;
  margin-top: -${HEADER_HEIGHT + (isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0)}px;
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

const ProfileImageWrap = styled(Flexbox)`
  position: relative;
  min-width: 96px;
  min-height: 96px;
  border-radius: 16px;
  background: ${({ theme: { palette } }) => palette.common.bg03};
  border: 2px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.uiWhite};
`;

export default UserShopEdit;
