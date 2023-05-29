import { useCallback, useEffect, useState } from 'react';

import TextareaAutosize from 'react-textarea-autosize';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Button,
  Chip,
  Flexbox,
  Icon,
  Image,
  Skeleton,
  Typography,
  dark,
  useTheme
} from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { AppUpdateNoticeDialog, FeatureIsMobileAppDownDialog } from '@components/UI/organisms';
import { TextInput } from '@components/UI/molecules';

import type { PutUserLegitProfileData } from '@dto/user';
import type { PhotoGuideImage } from '@dto/productLegit';
import type { LegitsBrand } from '@dto/model';

import { putLegitProfile } from '@api/user';

import { HEADER_HEIGHT, IOS_SAFE_AREA_TOP } from '@constants/common';

import {
  checkAgent,
  isExtendedLayoutIOSVersion,
  isNeedUpdateImageUploadAOSVersion,
  isNeedUpdateImageUploadIOSVersion
} from '@utils/common';

interface LegitProfileEditInfoProps extends PutUserLegitProfileData {
  legitsBrands: LegitsBrand[];
  onCloseEditMode: () => void;
}

// TODO 안쓰는것같은데 지워도 되는지?? 230111 noah
function LegitProfileEditInfo({
  legitsBrands,
  onCloseEditMode,
  ...userLegitProfileData
}: LegitProfileEditInfoProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [open, setOpen] = useState(false);
  const [openIOSNoticeDialog, setOpenIOSNoticeDialog] = useState(false);
  const [openAOSNoticeDialog, setOpenAOSNoticeDialog] = useState(false);

  const { mutate: mutatePutLegitProfile, isLoading: isLoadingMutate } = useMutation(
    putLegitProfile,
    {
      onSettled() {
        onCloseEditMode();
      }
    }
  );

  const [putLegitProfileParams, setPutLegitProfileParams] =
    useState<PutUserLegitProfileData>(userLegitProfileData);
  const [{ imageType, isLoadingGetPhoto }, setGetPhotoState] = useState<{
    imageType: 'profile' | 'background';
    isLoadingGetPhoto: boolean;
  }>({
    imageType: 'profile',
    isLoadingGetPhoto: false
  });

  const handleClickSave = useCallback(() => {
    if (isLoadingMutate) return;

    mutatePutLegitProfile(putLegitProfileParams);
  }, [isLoadingMutate, mutatePutLegitProfile, putLegitProfileParams]);

  const handleChangeImage = useCallback(
    (isBackground: boolean) => () => {
      if (isLoadingMutate || isLoadingGetPhoto) return;

      if (!checkAgent.isMobileApp()) {
        setOpen(true);
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

      setGetPhotoState((prevState) => ({
        ...prevState,
        imageType: isBackground ? 'background' : 'profile'
      }));

      if (
        checkAgent.isIOSApp() &&
        window.webkit &&
        window.webkit.messageHandlers &&
        window.webkit.messageHandlers.callPhotoGuide
      ) {
        window.webkit.messageHandlers.callPhotoGuide.postMessage(
          JSON.stringify({
            guideId: isBackground ? 25 : 24,
            viewMode: 'ALBUM',
            type: 2,
            imageType: 4
          })
        );
      }

      if (checkAgent.isAndroidApp() && window.webview && window.webview.callPhotoGuide) {
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
    [isLoadingGetPhoto, isLoadingMutate]
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
            setPutLegitProfileParams((prevState) => ({
              ...prevState,
              image: firstPhotoGuideImage.imageUrl
            }));

            break;
          }
          case 'background': {
            setPutLegitProfileParams((prevState) => ({
              ...prevState,
              imageBackground: firstPhotoGuideImage.imageUrl
            }));

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
  }, [imageType]);

  return (
    <>
      <Wrapper>
        <BackgroundImage
          src={
            putLegitProfileParams.imageBackground ||
            `https://${process.env.IMAGE_DOMAIN}/assets/images/legit/legit-profile-background.png`
          }
        >
          <Blur />
        </BackgroundImage>
        <Flexbox direction="vertical" gap={20} customStyle={{ flex: 1 }}>
          <Flexbox alignment="center" gap={18}>
            <Flexbox direction="vertical" gap={12} customStyle={{ flex: 1 }}>
              <Typography variant="h4" weight="bold" customStyle={{ color: common.cmnW }}>
                이름
              </Typography>
              <Flexbox direction="vertical" gap={8}>
                <TextInput
                  type="search"
                  placeholder="영어이름을 입력해주세요"
                  customStyle={{
                    padding: 12,
                    height: 44,
                    borderRadius: 8,
                    border: `1px solid ${common.line01}`
                  }}
                  inputStyle={{ height: 20, width: '100%' }}
                  value={putLegitProfileParams.name}
                  onChange={(e) =>
                    setPutLegitProfileParams((prevState) => ({
                      ...prevState,
                      name: e.target.value.replace(/[^a-zA-Z]/gi, '').slice(0, 16)
                    }))
                  }
                />
                <Typography
                  variant="small2"
                  weight="medium"
                  customStyle={{ marginLeft: 12, color: dark.palette.common.ui20 }}
                >
                  {`${putLegitProfileParams.name.length}/16자`}
                </Typography>
              </Flexbox>
            </Flexbox>
            <Box customStyle={{ position: 'relative' }} onClick={handleChangeImage(false)}>
              {!putLegitProfileParams.image && (
                <ProfileImageWrap>
                  <Icon
                    name="UserFilled"
                    customStyle={{ width: 52, height: 52, color: common.ui80 }}
                  />
                </ProfileImageWrap>
              )}
              {isLoadingGetPhoto && imageType === 'profile' ? (
                <Skeleton width={80} height={80} round="50%" disableAspectRatio />
              ) : (
                <Image
                  src={putLegitProfileParams.image}
                  alt="Legit Profile Img"
                  width={80}
                  height={80}
                  round="50%"
                  disableAspectRatio
                />
              )}
              <IconBox>
                <Icon name="CameraFilled" />
              </IconBox>
            </Box>
          </Flexbox>
          <Flexbox direction="vertical" gap={12}>
            <Typography variant="h4" weight="bold" customStyle={{ color: common.cmnW }}>
              한 줄 소개
            </Typography>
            <TextAreaWrap>
              <AutoTextArea
                placeholder={'한 줄 소개를 입력해주세요\n(명품 관련 주요 업무 경력, 감정 경력 등)'}
                value={putLegitProfileParams.title}
                onChange={(e) =>
                  setPutLegitProfileParams((prevState) => ({
                    ...prevState,
                    title: e.target.value.trim().substring(0, 100)
                  }))
                }
              />
              <TitleInfo variant="small2" weight="medium">
                {`${putLegitProfileParams.title.length || 0}/ 100자`}
              </TitleInfo>
            </TextAreaWrap>
          </Flexbox>
        </Flexbox>
        <Flexbox direction="vertical" gap={8} customStyle={{ marginTop: 20, zIndex: 1 }}>
          <Button
            size="large"
            startIcon={<Icon name={isLoadingGetPhoto ? 'LoadingFilled' : 'CameraFilled'} />}
            fullWidth
            onClick={handleChangeImage(true)}
            disabled={isLoadingGetPhoto || isLoadingMutate}
          >
            배경이미지 수정
          </Button>
        </Flexbox>
      </Wrapper>
      <Flexbox
        component="section"
        direction="vertical"
        gap={32}
        customStyle={{ padding: '32px 20px 52px' }}
      >
        <Flexbox direction="vertical" gap={12}>
          <Typography variant="h4" weight="bold">
            감정가능 브랜드 (최대 15개 선택)
          </Typography>
          <Flexbox gap={8} customStyle={{ flexWrap: 'wrap' }}>
            {legitsBrands.map(({ id, name: brandName }) => (
              <Chip
                key={`target-brand-${id}`}
                size="large"
                variant={
                  putLegitProfileParams.targetBrandIds.some((targetBrandId) => targetBrandId === id)
                    ? 'solid'
                    : 'outline'
                }
                brandColor="black"
                customStyle={{ whiteSpace: 'nowrap' }}
                onClick={() =>
                  setPutLegitProfileParams((prevState) => ({
                    ...prevState,
                    targetBrandIds: prevState.targetBrandIds.some(
                      (targetBrandId) => targetBrandId === id
                    )
                      ? prevState.targetBrandIds.filter((targetBrandId) => targetBrandId !== id)
                      : prevState.targetBrandIds.concat([id])
                  }))
                }
              >
                #{brandName}
              </Chip>
            ))}
          </Flexbox>
        </Flexbox>
        <Flexbox direction="vertical" gap={12}>
          <Typography variant="h4" weight="bold">
            웹사이트
          </Typography>
          <TextInput
            type="search"
            variant="outline"
            customStyle={{ padding: 12, height: 44, border: `1px solid ${common.ui90}` }}
            inputStyle={{ height: 20, width: '100%' }}
            value={putLegitProfileParams.urlShop}
            onChange={(e) =>
              setPutLegitProfileParams((prevState) => ({
                ...prevState,
                urlShop: e.target.value.trim()
              }))
            }
          />
        </Flexbox>
      </Flexbox>
      <ButtonWrapper>
        <ButtonBox>
          <Button
            type="submit"
            size="xlarge"
            variant="solid"
            brandColor="primary"
            fullWidth
            disabled={
              putLegitProfileParams.name.length === 0 ||
              putLegitProfileParams.title.length === 0 ||
              putLegitProfileParams.image.length === 0 ||
              putLegitProfileParams.targetBrandIds.length === 0 ||
              putLegitProfileParams.urlShop.length === 0 ||
              isLoadingMutate ||
              isLoadingGetPhoto
            }
            onClick={handleClickSave}
          >
            {isLoadingMutate ? <Icon name="LoadingFilled" /> : '저장'}
          </Button>
        </ButtonBox>
      </ButtonWrapper>
      <FeatureIsMobileAppDownDialog open={open} onClose={() => setOpen(false)} />
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

const ProfileImageWrap = styled(Flexbox)`
  position: relative;
  min-width: 80px;
  min-height: 80px;
  border-radius: 50%;
  background: ${({ theme: { palette } }) => palette.common.bg03};
`;

const Wrapper = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20px;
  min-height: 520px;
  padding-top: ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '56px'};
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
  left: 0;
  top: 0;
`;

const Blur = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  position: absolute;
  margin: -20px;
  background: ${({ theme: { palette } }) => palette.common.overlay40};
  backdrop-filter: blur(8px);
  z-index: -1;
`;

const IconBox = styled.div`
  position: absolute;
  right: 0;
  display: inline-flex;
  justify-content: center;
  transform: translateY(-100%);
  background-color: ${({ theme }) => theme.palette.common.cmnW};
  border: 1px solid ${({ theme }) => theme.palette.common.line01};
  border-radius: 100%;
  padding: 8px;
`;

// const Title = styled.div`
//   position: relative;

//   textarea {
//     min-height: 168px;
//     width: 100%;
//     background-color: ${({ theme: { palette } }) => palette.common.bg01};
//     border: 1px solid ${({ theme: { palette } }) => palette.common.line01};
//     border-radius: 8px;
//     padding: 12px 12px 24px;
//     resize: none;
//     color: ${({ theme: { palette } }) => palette.common.ui20};

//     ${({ theme: { typography } }) => ({
//       fontSize: typography.h4.size,
//       fontWeight: typography.h4.weight.regular,
//       lineHeight: typography.h4.lineHeight,
//       letterSpacing: typography.h4.letterSpacing
//     })};

//     ::placeholder {
//       color: ${({ theme: { palette } }) => palette.common.ui80};
//       white-space: pre-wrap;
//     }
//   }
// `;

const TitleInfo = styled(Typography)`
  display: inline-flex;
  bottom: 6px;
  position: absolute;
  left: 0;
  padding: 0 0 12px 12px;
  color: ${dark.palette.common.ui60};
`;

const ButtonWrapper = styled.section`
  position: relative;
  width: 100%;
  min-height: 92px;
`;

const ButtonBox = styled.div`
  position: fixed;
  width: 100%;
  bottom: 0;
  padding: 20px;
  background-color: ${({ theme }) => theme.palette.common.bg03};
  z-index: ${({ theme: { zIndex } }) => zIndex.button};
`;

const TextAreaWrap = styled.div<{ ban?: boolean }>`
  width: 100%;
  height: 206px;
  margin-top: 12px;
  padding: 12px;
  border: 1px solid
    ${({
      theme: {
        palette: { common, secondary }
      },
      ban
    }) => (ban ? secondary.red.light : common.line01)};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  font-weight: ${({ theme: { typography } }) => typography.h4.weight.regular};
  font-size: ${({ theme: { typography } }) => typography.h4.size};
`;

const AutoTextArea = styled(TextareaAutosize)`
  width: 100%;
  min-height: 150px;
  font-size: ${({ theme: { typography } }) => typography.h4};
  line-height: 20px;
  resize: none;
  margin-bottom: 10px;
  outline: none;
`;

export default LegitProfileEditInfo;
