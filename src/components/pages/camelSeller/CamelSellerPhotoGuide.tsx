import { MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import { find } from 'lodash-es';
import styled from '@emotion/styled';

import Image from '@components/UI/atoms/Image';

import type { PhotoGuideParams } from '@dto/common';

import LocalStorage from '@library/localStorage';

import { fetchPhotoGuide } from '@api/common';

import queryKeys from '@constants/queryKeys';
import { CAMEL_SELLER } from '@constants/localStorage';
import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';

import { checkAgent } from '@utils/common';

import type {
  CamelSellerLocalStorage,
  MergePhotoImages,
  PhotoGuideImages,
  SubmitType
} from '@typings/camelSeller';
import { showAppDownloadBannerState } from '@recoil/common';
import {
  camelSellerBooleanStateFamily,
  camelSellerEditState,
  camelSellerSubmitState
} from '@recoil/camelSeller';

import SkeletonPhotoGuideBox from './SkeletonPhotoGuideBox';
import PhotoIconBox from './PhotoIconBox';

// const sample = [
//   {
//     dateUpdated: '2022-09-30 06:50:14',
//     dateCreated: '2022-09-30 06:50:14',
//     id: 215,
//     productId: 32974535,
//     photoGuideId: 75,
//     imageSize: 0,
//     imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/mrcamel/product/20210723_12842408_0.jpg'
//   },
//   {
//     dateUpdated: '2022-09-30 06:50:14',
//     dateCreated: '2022-09-30 06:50:14',
//     id: 216,
//     productId: 32974535,
//     photoGuideId: 76,
//     imageSize: 0,
//     imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/mrcamel/product/20210723_12842408_0.jpg'
//   }
// ];

function CamelSellerPhotoGuide() {
  const {
    theme: {
      palette: { secondary, common, primary }
    }
  } = useTheme();
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const [submitData, setSubmitData] = useRecoilState(camelSellerSubmitState);
  const [editData, setEditData] = useRecoilState(camelSellerEditState);
  const editMode = useRecoilValue(camelSellerBooleanStateFamily('edit'));
  const { isState } = useRecoilValue(camelSellerBooleanStateFamily('submitClick'));
  const setRequirePhotoValid = useSetRecoilState(
    camelSellerBooleanStateFamily('requirePhotoValid')
  );
  const [photoImages, setPhotoImages] = useState<PhotoGuideImages[]>([]);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [photoGuideParams, setPhotoGuideParams] = useState<PhotoGuideParams>({
    brandId: 0,
    categoryId: 0,
    type: 0
  });
  const { data: guideImages, isSuccess } = useQuery(
    queryKeys.commons.photoGuide(photoGuideParams),
    () => fetchPhotoGuide(photoGuideParams),
    {
      enabled: !!photoGuideParams.brandId
    }
  );

  useEffect(() => {
    const getData = editData || (LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage);
    if (editData) {
      setPhotoImages(editData.photoGuideImages);
    }
    if (!editData && submitData?.photoGuideImages && submitData.photoGuideImages.length > 0) {
      setPhotoImages(submitData?.photoGuideImages);
    }
    setPhotoGuideParams({
      brandId: getData?.brand?.id as number,
      categoryId: getData?.category?.id as number,
      type: 0
    });
  }, [editData, submitData?.photoGuideImages]);

  useEffect(() => {
    window.getPhotoGuide = () => {
      setIsImageLoading(true);
    };

    window.getPhotoGuideDone = (result: PhotoGuideImages[]) => {
      const isImages = result.filter(({ imageUrl }) => !!imageUrl);
      setIsImageLoading(false);
      setPhotoImages(isImages);
      if (editMode.isState) {
        setEditData({
          ...(editData as CamelSellerLocalStorage),
          photoGuideImages: isImages
        });
      } else {
        LocalStorage.set(CAMEL_SELLER, {
          ...(LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage),
          photoGuideImages: isImages
        });
      }
      setSubmitData({
        ...(submitData as SubmitType),
        photoGuideImages: isImages
      });
    };
  }, [editData, editMode.isState, setEditData, setSubmitData, submitData]);

  const isIOSCallMessage = () => {
    return !!(
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.callPhotoGuide
    );
  };

  const handleClickCallPhotoGuide = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (checkAgent.isIOSApp() && isIOSCallMessage()) {
      window.webkit.messageHandlers.callPhotoGuide.postMessage(
        JSON.stringify({
          guideId: guideImages?.groupId,
          viewMode: 'ALBUM',
          startId: Number(target.dataset.index),
          imageType: Number(target.dataset.type),
          images: photoImages.map((a) => ({ photoGuideId: a.photoGuideId, imageUrl: a.imageUrl }))
        })
      );
    }
  };

  const mergePhotoResult = useCallback(() => {
    if (photoImages.length > 0 && guideImages) {
      return guideImages.photoGuideDetails.map((photoGuide) => {
        if (find(photoImages, { photoGuideId: photoGuide.id })) {
          return {
            ...find(photoImages, { photoGuideId: photoGuide.id }),
            isRequired: photoGuide.isRequired,
            imageType: photoGuide.imageType,
            imageWatermark: photoGuide.imageWatermark
          };
        }
        return photoGuide as MergePhotoImages;
      });
    }
    return null;
  }, [guideImages, photoImages]);

  const isRequiredPhotoValid = useCallback(() => {
    if (mergePhotoResult() && photoImages) {
      return !mergePhotoResult()
        ?.map((result) => {
          if (result.isRequired && result.imageType === 1 && result.imageUrl) {
            return true as boolean;
          }
          if (result.isRequired && result.imageType === 1 && !result.imageUrl) {
            return false;
          }
          return null;
        })
        .includes(false as boolean);
    }
    return false;
  }, [mergePhotoResult, photoImages]);

  const isAllRequiredPhotoValid = useCallback(() => {
    if (mergePhotoResult && photoImages) {
      return !mergePhotoResult()
        ?.map((result) => {
          if (result.isRequired) {
            if (result.imageUrl) {
              return true as boolean;
            }
            return false as boolean;
          }
          return null;
        })
        .includes(false as boolean);
    }
    return false;
  }, [mergePhotoResult, photoImages]);

  const photoRegisterStateText = useMemo(() => {
    if (isRequiredPhotoValid() && isAllRequiredPhotoValid())
      return `감정에 필요한 사진까지 등록했어요!\n
    매물 등록 시, 사진감정이 무료로 신청됩니다.`;
    if (isRequiredPhotoValid() && !isAllRequiredPhotoValid()) return '필수사진을 모두 등록했어요.';
    if (isState && !isRequiredPhotoValid()) return '필수사진을 등록해주세요';
    if (!isState && !isRequiredPhotoValid())
      return '가이드에 맞춰 사진을 등록하면 더 빠르게 판매할 수 있어요!';
    return '';
  }, [isRequiredPhotoValid, isAllRequiredPhotoValid, isState]);

  const isPhotoUrl = useMemo(() => photoImages.filter((img) => !!img.imageUrl), [photoImages]);

  const count = useMemo(() => {
    if (editData) {
      return editData.photoGuideImages?.length;
    }
    if (photoImages) {
      return isPhotoUrl.length;
    }
    return 0;
  }, [editData, isPhotoUrl.length, photoImages]);

  useEffect(() => {
    if (isRequiredPhotoValid()) {
      setRequirePhotoValid(({ type }) => ({
        type,
        isState: true
      }));
    }
  }, [isRequiredPhotoValid, editData, setRequirePhotoValid]);

  return (
    <StyledPhotoGuide showAppDownloadBanner={showAppDownloadBanner}>
      <PhotoGuideArea gap={8}>
        <PhotoIconBox onClick={handleClickCallPhotoGuide} count={count} />
        {!isSuccess && <SkeletonPhotoGuideBox />}
        {isSuccess &&
          !mergePhotoResult() &&
          guideImages?.photoGuideDetails?.map(
            ({ imageWatermark, isRequired, imageType, sort }, i) => (
              <GuideBox
                key={`photo-guide-${sort}`}
                data-index={i}
                data-type={imageType}
                onClick={handleClickCallPhotoGuide}
              >
                {isImageLoading ? (
                  <AnimationLoading
                    src={`https://${process.env.IMAGE_DOMAIN}/assets/images/ico/photo_loading_fill.png`}
                    alt="이미지 로딩중"
                    disableAspectRatio
                  />
                ) : (
                  <CenterImage src={imageWatermark} disableAspectRatio />
                )}
                {isRequired && (
                  <RequireText weight="medium" variant="small2">
                    {imageType === 1 ? '필수' : '감정'}
                  </RequireText>
                )}
              </GuideBox>
            )
          )}
        {mergePhotoResult() &&
          mergePhotoResult()?.map(({ imageWatermark, isRequired, imageUrl, imageType }, i) => (
            <GuideBox
              key={`photo-guide-${imageWatermark}`}
              data-index={i}
              data-type={imageType}
              onClick={handleClickCallPhotoGuide}
            >
              {isImageLoading && !imageUrl ? (
                <AnimationLoading
                  src={`https://${process.env.IMAGE_DOMAIN}/assets/images/ico/photo_loading_fill.png`}
                  alt="이미지 로딩중"
                  disableAspectRatio
                />
              ) : (
                <>
                  <Image
                    src={imageUrl}
                    disableAspectRatio
                    customStyle={imageUrl ? {} : { opacity: 0.5, width: '66%' }}
                  />
                  <OverlayWarterMark>
                    <CenterImage src={imageWatermark} disableAspectRatio />
                  </OverlayWarterMark>
                </>
              )}
              {isRequired && (
                <RequireText weight="medium" variant="small2">
                  {imageType === 1 ? '필수' : '감정'}
                </RequireText>
              )}
            </GuideBox>
          ))}
      </PhotoGuideArea>
      <Flexbox alignment="center" customStyle={{ width: 'calc(100% - 20px)', marginLeft: 20 }}>
        <Flexbox alignment="flex-start">
          <Icon
            name={isRequiredPhotoValid() ? 'CheckCircleFilled' : 'BangCircleFilled'}
            size="small"
            customStyle={{
              color: isState && !isRequiredPhotoValid() ? secondary.red.main : primary.light
            }}
          />
          <Typography
            variant="small1"
            customStyle={{
              marginRight: 'auto',
              color: isState && !isRequiredPhotoValid() ? secondary.red.main : common.ui20,
              marginLeft: 5
            }}
          >
            {photoRegisterStateText}
          </Typography>
        </Flexbox>
      </Flexbox>
    </StyledPhotoGuide>
  );
}

const StyledPhotoGuide = styled.div<{ showAppDownloadBanner: boolean }>`
  width: 100%;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui95};
  position: absolute;
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? 56 + APP_DOWNLOAD_BANNER_HEIGHT : 56}px;
  left: 0;
  padding: 20px 0;
`;

const PhotoGuideArea = styled(Flexbox)`
  margin-bottom: 12px;
  width: 100%;
  overflow-x: auto;
  padding: 0 20px;
`;

const GuideBox = styled.div`
  min-width: 72px;
  width: 72px;
  height: 72px;
  border-radius: 8px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg03};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
`;

const RequireText = styled(Typography)`
  position: absolute;
  left: 4px;
  top: 4px;
  background: rgba(0, 0, 0, 0.3);
  color: ${({ theme: { palette } }) => palette.common.uiWhite};
  padding: 3px 4px;
  border-radius: 4px;
`;

const AnimationLoading = styled(Image)`
  animation: rotate 1s linear infinite;
  width: 30px;
  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const OverlayWarterMark = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CenterImage = styled(Image)`
  opacity: 0.5;
  width: 66%;
  display: block;
  margin: 0 auto;
`;

export default CamelSellerPhotoGuide;
