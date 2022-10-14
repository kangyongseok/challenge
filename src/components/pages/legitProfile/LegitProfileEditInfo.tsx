import { useCallback, useEffect, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import TextareaAutosize from 'react-textarea-autosize';
import { useMutation } from 'react-query';
import { Box, Button, Chip, Flexbox, Icon, Typography, dark, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { TextInput } from '@components/UI/molecules';
import { Image, Skeleton } from '@components/UI/atoms';

import type { PutUserLegitProfileData } from '@dto/user';
import type { PhotoGuideImage } from '@dto/productLegit';
import type { LegitsBrand } from '@dto/model';

import { putLegitProfile } from '@api/user';

import { checkAgent, handleClickAppDownload } from '@utils/common';

import { toastState } from '@recoil/common';

interface LegitProfileEditInfoProps extends PutUserLegitProfileData {
  legitsBrands: LegitsBrand[];
  onCloseEditMode: () => void;
}

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

  const setToastState = useSetRecoilState(toastState);

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
        setToastState({
          type: 'legitProfile',
          status: 'disableUpload',
          action() {
            handleClickAppDownload({});
          }
        });
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
            imageType: 3
          })
        );
      }
    },
    [isLoadingGetPhoto, isLoadingMutate, setToastState]
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
      <Wrapper
        backgroundImage={
          putLegitProfileParams.imageBackground ||
          `https://${process.env.IMAGE_DOMAIN}/assets/images/legit/legit-profile-background.png`
        }
      >
        <Blur />
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
                  customStyle={{ color: dark.palette.common.ui20 }}
                >
                  {`${putLegitProfileParams.name.length}/16자`}
                </Typography>
              </Flexbox>
            </Flexbox>
            <Box customStyle={{ position: 'relative' }} onClick={handleChangeImage(false)}>
              {isLoadingGetPhoto && imageType === 'profile' ? (
                <Skeleton
                  width="96px"
                  height="96px"
                  disableAspectRatio
                  customStyle={{ borderRadius: '50%' }}
                />
              ) : (
                <Image
                  src={
                    putLegitProfileParams.image ||
                    `https://${process.env.IMAGE_DOMAIN}/assets/images/legit/legit-profile-image.png`
                  }
                  width="96px"
                  height="96px"
                  disableAspectRatio
                  customStyle={{ borderRadius: '50%' }}
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
            <Title>
              <TextareaAutosize
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
            </Title>
          </Flexbox>
        </Flexbox>
        <Flexbox direction="vertical" gap={8} customStyle={{ zIndex: 1 }}>
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
                    ? 'contained'
                    : 'outlined'
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
            variant="outlined"
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
            variant="contained"
            brandColor="primary"
            fullWidth
            disabled={
              putLegitProfileParams.name.length === 0 ||
              putLegitProfileParams.title.length === 0 ||
              putLegitProfileParams.image.length === 0 ||
              putLegitProfileParams.imageBackground.length === 0 ||
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
    </>
  );
}

const Wrapper = styled.section<{ backgroundImage: string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20px;
  user-select: none;
  min-height: 520px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-image: url(${({ backgroundImage }) => backgroundImage});
`;

const Blur = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  position: absolute;
  margin: -20px;
  backdrop-filter: blur(6px);
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

const Title = styled.div`
  position: relative;

  textarea {
    min-height: 168px;
    width: 100%;
    background-color: ${({ theme: { palette } }) => palette.common.bg01};
    border: 1px solid ${({ theme: { palette } }) => palette.common.line01};
    border-radius: 8px;
    padding: 12px 12px 24px;
    resize: none;
    color: ${({ theme: { palette } }) => palette.common.ui20};

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
  user-select: none;
`;

const ButtonBox = styled.div`
  position: fixed;
  width: 100%;
  bottom: 0;
  padding: 20px;
  background-color: ${({ theme }) => theme.palette.common.bg03};
  z-index: ${({ theme: { zIndex } }) => zIndex.button};
`;

export default LegitProfileEditInfo;
