import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { BottomSheet, Button, Flexbox, Icon, Label, Skeleton, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import ImageDetailDialog from '@components/UI/organisms/ImageDetailDialog';

import { logEvent } from '@library/amplitude';

import { fetchProduct } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { NEXT_IMAGE_BLUR_URL } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

import { deviceIdState } from '@recoil/common';
import { camelSellerIsImageLoadingState, camelSellerTempSaveDataState } from '@recoil/camelSeller';

import PhotoIconBox from './PhotoIconBox';

function CamelSellerProductImage() {
  const { query } = useRouter();
  const deviceId = useRecoilValue(deviceIdState);
  const productId = Number(query.id || 0);
  const [isImageLoading, setIsImageLoadingState] = useRecoilState(camelSellerIsImageLoadingState);
  const [tempData, setTempData] = useRecoilState(camelSellerTempSaveDataState);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageRendered, setImageRendered] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openBottomSheet, setOpenBottomSheet] = useState(false);
  const [images, setImages] = useState<string[]>(tempData.images);
  const { data: editData, isLoading } = useQuery(
    queryKeys.products.sellerEditProduct({ productId, deviceId }),
    () => fetchProduct({ productId, deviceId }),
    {
      enabled: !!productId
    }
  );

  // 전환 판매자 매물
  const isExternalNormalSeller = editData?.product.productSeller.type === 4;

  useEffect(() => {
    window.getPhotoGuide = () => {
      setIsImageLoadingState(true);
    };

    window.getPhotoGuideDone = (result: { imageUrl: string }[]) => {
      logEvent(attrKeys.camelSeller.LOAD_PHOTO_GUIDE, {
        name: attrProperty.name.PRODUCT_MAIN,
        title: attrProperty.title.PRODUCT_MAIN,
        count: result.length,
        data: result
      });

      setIsImageLoadingState(false);
      setTempData((prevState) => ({
        ...prevState,
        images: prevState.images.concat(
          result.filter(({ imageUrl }) => !!imageUrl).map(({ imageUrl }) => imageUrl)
        )
      }));
    };
  }, [setIsImageLoadingState, setTempData]);

  useEffect(() => {
    setImages(tempData.images);
  }, [tempData.images]);

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

  const handleClickPhoto = () => {
    logEvent(attrKeys.camelSeller.CLICK_PHOTO_GUIDE, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.PRODUCT_MAIN,
      guideId: 74,
      viewMode: 'ALBUM',
      type: 0,
      imageType: 5
    });
    if (images.length === 10) return;

    if (checkAgent.isIOSApp() && isIOSCallMessage()) {
      // TODO 추후 업데이트
      window.webkit.messageHandlers.callPhotoGuide.postMessage(
        JSON.stringify({
          guideId: 74,
          viewMode: 'ALBUM',
          type: 0,
          imageType: 5,
          imageCount: images.length
        })
      );
    }
    if (checkAgent.isAndroidApp() && isAndroidCallMessage()) {
      window.webview.callPhotoGuide(
        74,
        JSON.stringify({
          viewMode: 'ALBUM',
          type: 0,
          imageType: 5,
          imageCount: images.length
        })
      );
    }
  };

  const handleClickDelete = (newIndex: number) => (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    logEvent(attrKeys.camelSeller.CLICK_PIC, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.DELETE,
      index: currentIndex
    });

    setTempData((prevState) => ({
      ...prevState,
      images: prevState.images.filter((_, index) => index !== newIndex)
    }));
  };

  const handleLoadComplete = () => {
    setImageRendered(true);
  };

  const handleClickImage = (e: MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;

    setCurrentIndex(Number(target.dataset.index));
    setOpenBottomSheet(true);
  };

  const handleClickImageDetail = () => {
    logEvent(attrKeys.camelSeller.CLICK_PIC, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.GALLERY,
      index: currentIndex
    });

    setOpenBottomSheet(false);
    setOpenModal(true);
  };

  const handleClickChangeMainImage = () => {
    logEvent(attrKeys.camelSeller.CLICK_PIC, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.SET_FIRST,
      index: currentIndex
    });

    const currentImage = tempData.images.find((_, index) => index === currentIndex);

    if (currentImage) {
      setTempData((prevState) => ({
        ...prevState,
        images: [currentImage, ...prevState.images.filter((_, index) => index !== currentIndex)]
      }));
    }

    setOpenBottomSheet(false);
  };

  return (
    <>
      <StyledWrap>
        <Flexbox
          alignment="center"
          gap={8}
          customStyle={{ flexWrap: 'nowrap', width: 'fit-content' }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {!isExternalNormalSeller && (
            <PhotoIconBox totalImageCount={10} count={images.length} onClick={handleClickPhoto} />
          )}
          {images.map((image, index) => (
            <ProductImageWrap
              data-index={index}
              // eslint-disable-next-line react/no-array-index-key
              key={`photo-guide-${index}-${image?.split('/')[image.split('/').length - 1]}`}
              onClick={handleClickImage}
            >
              <Image
                src={image}
                alt={image?.split('/')[image.split('/').length - 1]}
                placeholder="blur"
                blurDataURL={NEXT_IMAGE_BLUR_URL}
                onLoadingComplete={handleLoadComplete}
                layout="fill"
                objectFit="cover"
                style={{ borderRadius: 8 }}
                width="84px"
                height="84px"
              />
              {!imageRendered && <Skeleton width={84} height={84} round={8} disableAspectRatio />}
              <DeleteIconWrap
                justifyContent="center"
                alignment="center"
                onClick={handleClickDelete(index)}
              >
                <Icon name="CloseOutlined" />
              </DeleteIconWrap>
              {index === 0 && (
                <Label
                  variant="outline"
                  brandColor="black"
                  size="xsmall"
                  text="대표사진"
                  customStyle={{
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    borderColor: 'transparent'
                  }}
                />
              )}
            </ProductImageWrap>
          ))}
          {isImageLoading && (
            <Flexbox
              justifyContent="center"
              alignment="center"
              customStyle={{
                position: 'relative',
                width: 84,
                height: 84,
                background: '#eeeeee',
                borderRadius: 8
              }}
            >
              <AnimationLoading
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/ico/photo_loading_fill.png`}
                alt="이미지 로딩중"
                width="40px"
                height="40px"
              />
            </Flexbox>
          )}
        </Flexbox>
        {!isLoading && (
          <ImageDetailDialog
            open={openModal}
            onClose={() => setOpenModal(false)}
            images={images.map((image) => image)}
            syncIndex={currentIndex}
          />
        )}
      </StyledWrap>
      <BottomSheet
        open={openBottomSheet}
        onClose={() => setOpenBottomSheet(false)}
        disableSwipeable
        customStyle={{
          padding: 20
        }}
      >
        <Flexbox
          alignment="center"
          justifyContent="center"
          onClick={handleClickChangeMainImage}
          customStyle={{
            height: 48
          }}
        >
          <Typography variant="h3" weight="medium">
            대표사진으로 변경
          </Typography>
        </Flexbox>
        <Flexbox
          alignment="center"
          justifyContent="center"
          onClick={handleClickImageDetail}
          customStyle={{
            height: 48
          }}
        >
          <Typography variant="h3" weight="medium">
            사진 상세보기
          </Typography>
        </Flexbox>
        <Button
          variant="ghost"
          brandColor="black"
          size="xlarge"
          fullWidth
          customStyle={{
            marginTop: 20
          }}
        >
          취소
        </Button>
      </BottomSheet>
    </>
  );
}

const StyledWrap = styled.div`
  width: calc(100% + 40px);
  padding: 20px 20px 0 20px;
  overflow-x: auto;
  margin-left: -20px;
`;

const ProductImageWrap = styled.div`
  min-width: 84px;
  height: 84px;
  border-radius: 8px;
  position: relative;
`;

const DeleteIconWrap = styled(Flexbox)`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  padding: 4px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui20};
  svg {
    color: ${({
      theme: {
        palette: { common }
      }
    }) => common.uiWhite};
  }
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

export default CamelSellerProductImage;
