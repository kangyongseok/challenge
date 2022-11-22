import { MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import { find } from 'lodash-es';
import styled from '@emotion/styled';

import ImageDetailDialog from '@components/UI/organisms/ImageDetailDialog';
import Image from '@components/UI/atoms/Image';

import type { PhotoGuideParams } from '@dto/common';

import { logEvent } from '@library/amplitude';

import { fetchProduct } from '@api/product';
import { fetchPhotoGuide } from '@api/common';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

import type { EditPhotoGuideImages, MergePhotoImages } from '@typings/camelSeller';
import { deviceIdState } from '@recoil/common';
import {
  camelSellerBooleanStateFamily,
  camelSellerIsImageLoadingState,
  camelSellerTempSaveDataState
} from '@recoil/camelSeller';

import SkeletonPhotoGuideBox from './SkeletonPhotoGuideBox';
import PhotoIconBox from './PhotoIconBox';

function CamelSellerPhotoGuideEdit() {
  const {
    theme: {
      palette: { secondary, common, primary }
    }
  } = useTheme();
  const { query } = useRouter();
  const deviceId = useRecoilValue(deviceIdState);
  const productId = Number(query.id || 0);
  const { isState } = useRecoilValue(camelSellerBooleanStateFamily('submitClick'));
  const setRequirePhotoValid = useSetRecoilState(
    camelSellerBooleanStateFamily('requirePhotoValid')
  );
  const [openModal, setOpenModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tempData, setTempData] = useRecoilState(camelSellerTempSaveDataState);
  const [photoImages, setPhotoImages] = useState<EditPhotoGuideImages[]>([]);
  const [isImageLoading, setIsImageLoadingState] = useRecoilState(camelSellerIsImageLoadingState);
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
  const { data: editData } = useQuery(
    queryKeys.products.sellerEditProducs({ productId, deviceId }),
    () => fetchProduct({ productId, deviceId }),
    {
      enabled: !!productId
    }
  );

  useEffect(() => {
    if (editData && photoImages.length === 0) {
      setPhotoImages(editData.product.photoGuideImages);
      setPhotoGuideParams({
        brandId: editData.product.brand.id || 0,
        categoryId: editData.product.category.id || 0,
        type: 0
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, editData]);

  useEffect(() => {
    window.getPhotoGuide = () => {
      setIsImageLoadingState(true);
    };

    window.getPhotoGuideDone = (result: EditPhotoGuideImages[]) => {
      const filterImages = result.filter(({ imageUrl }) => !!imageUrl);
      const isImages = filterImages.map(({ imageUrl, photoGuideId }) => ({
        commonPhotoGuideDetail: { id: Number(photoGuideId) },
        photoGuideId: Number(photoGuideId),
        imageUrl
        // productId: Number(query.id)
      }));

      setIsImageLoadingState(false);
      setPhotoImages(isImages);
      setTempData({
        ...tempData,
        photoGuideImages: isImages
      });
      // setSubmitData({
      //   ...(submitData as SubmitType),
      //   photoGuideImages: isImages
      // });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempData]);

  const isIOSCallMessage = () => {
    return !!(
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.callPhotoGuide
    );
  };

  const isAndroidCallMessage = () => {
    return !!(window.webview && window.webview.callPhotoGuide);
  };

  const handleClickCallPhotoGuide = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    logEvent(attrKeys.camelSeller.CLICK_PHOTO_GUIDE, {
      name: attrProperty.name.PRODUCT_MAIN,
      index: target.dataset.index ? Number(target.dataset.index) + 1 : 0
    });

    if (checkAgent.isIOSApp() && isIOSCallMessage()) {
      window.webkit.messageHandlers.callPhotoGuide.postMessage(
        JSON.stringify({
          guideId: guideImages?.groupId,
          viewMode: 'ALBUM',
          startId: Number(target.dataset.index),
          imageType: Number(target.dataset.type),
          images: photoImages.map((imageInfo) => ({
            photoGuideId: imageInfo.commonPhotoGuideDetail.id,
            imageUrl: imageInfo.imageUrl
          }))
        })
      );
    }
    if (checkAgent.isAndroidApp() && isAndroidCallMessage()) {
      window.webview.callPhotoGuide(
        guideImages?.groupId,
        JSON.stringify({
          viewMode: 'ALBUM',
          startId: Number(target.dataset.index),
          imageType: Number(target.dataset.type),
          images: photoImages.map((imageInfo) => ({
            photoGuideId: imageInfo.commonPhotoGuideDetail.id,
            imageUrl: imageInfo.imageUrl
          }))
        })
      );
    }
  };

  const mergePhotoResult = useCallback(() => {
    if (photoImages.length > 0 && guideImages) {
      return guideImages.photoGuideDetails.map((photoGuide) => {
        if (find(photoImages, { commonPhotoGuideDetail: { id: photoGuide.id } })) {
          return {
            ...find(photoImages, { commonPhotoGuideDetail: { id: photoGuide.id } }),
            isRequired: photoGuide.isRequired,
            imageType: photoGuide.imageType,
            imageWatermark: photoGuide.imageWatermark,
            imageWatermarkDark: photoGuide.imageWatermarkDark
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
      return (
        <p>
          감정에 필요한 사진까지 등록했어요!
          <br />
          매물 등록 시, 사진감정이 무료로 신청됩니다.
        </p>
      );
    if (isRequiredPhotoValid() && !isAllRequiredPhotoValid()) return '필수사진을 모두 등록했어요.';
    if (isState && !isRequiredPhotoValid()) return '필수사진을 등록해주세요';
    if (!isState && !isRequiredPhotoValid())
      return '가이드에 맞춰 사진을 등록하면 더 빠르게 판매할 수 있어요!';
    return '';
  }, [isRequiredPhotoValid, isAllRequiredPhotoValid, isState]);

  const isPhotoUrl = useMemo(() => photoImages.filter((img) => !!img.imageUrl), [photoImages]);

  const count = useMemo(() => {
    if (photoImages) {
      return isPhotoUrl.length;
    }
    return 0;
  }, [isPhotoUrl.length, photoImages]);

  useEffect(() => {
    setRequirePhotoValid(({ type }) => ({
      type,
      isState: isRequiredPhotoValid()
    }));
  }, [isRequiredPhotoValid, editData, setRequirePhotoValid]);

  useEffect(() => {
    return () => {
      setIsImageLoadingState(false);
    };
  }, [setIsImageLoadingState]);

  const handleClickDetailModal = (e: MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    logEvent(attrKeys.camelSeller.CLICK_PIC, {
      name: attrProperty.name.PRODUCT_MAIN,
      index: target.dataset.index,
      att: 'SAVE'
    });

    setCurrentIndex(Number(target.dataset.index));
    setOpenModal(true);
  };

  return (
    <StyledPhotoGuide isLongText={isRequiredPhotoValid() && isAllRequiredPhotoValid()}>
      <PhotoGuideArea gap={8}>
        <PhotoIconBox
          onClick={handleClickCallPhotoGuide}
          count={count}
          totalImageCount={guideImages?.photoGuideDetails.length as number}
        />
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
          mergePhotoResult()?.map(
            ({ imageWatermark, isRequired, imageUrl, imageType, imageWatermarkDark }, i) => (
              <GuideBox
                key={`photo-guide-${imageWatermark}`}
                data-index={i}
                data-type={imageType}
                onClick={imageUrl ? handleClickDetailModal : handleClickCallPhotoGuide}
              >
                {isImageLoading ? (
                  <AnimationLoading
                    src={`https://${process.env.IMAGE_DOMAIN}/assets/images/ico/photo_loading_fill.png`}
                    alt="이미지 로딩중"
                    disableAspectRatio
                  />
                ) : (
                  <>
                    <FullCoverImage src={imageUrl} disableAspectRatio isImage={!!imageUrl} />
                    <OverlayWarterMark>
                      <CenterImage
                        isImage={!!imageUrl}
                        src={imageUrl ? imageWatermarkDark : imageWatermark}
                        disableAspectRatio
                      />
                    </OverlayWarterMark>
                  </>
                )}
                {isRequired && (
                  <RequireText weight="medium" variant="small2">
                    {imageType === 1 ? '필수' : '감정'}
                  </RequireText>
                )}
              </GuideBox>
            )
          )}
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
      {mergePhotoResult() && (
        <ImageDetailDialog
          open={openModal}
          onClose={() => setOpenModal(false)}
          images={
            mergePhotoResult()
              ?.filter((result) => result.imageUrl)
              .map((item) => item.imageUrl) as string[]
          }
          syncIndex={currentIndex}
        />
      )}
    </StyledPhotoGuide>
  );
}

const StyledPhotoGuide = styled.div<{ isLongText: boolean }>`
  width: 100%;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui95};
  position: absolute;
  top: 56px;
  left: 0;
  padding: ${({ isLongText }) => (isLongText ? '10px 0' : '20px 0')};
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
  & > div:first-of-type {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
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

const CenterImage = styled(Image)<{ isImage?: boolean }>`
  opacity: ${({ isImage }) => (isImage ? 1 : 0.5)};
  width: 66%;
  display: block;
  margin: 0 auto;
`;

const FullCoverImage = styled(Image)<{ isImage: boolean }>`
  object-fit: cover;
  opacity: ${({ isImage }) => (isImage ? 1 : 0.5)};
  width: ${({ isImage }) => (isImage ? '72px' : '66%')};
  height: 72px;
`;

export default CamelSellerPhotoGuideEdit;
