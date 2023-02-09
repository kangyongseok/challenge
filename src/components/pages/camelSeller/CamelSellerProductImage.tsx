import { useEffect, useRef, useState } from 'react';
import type { MouseEvent, TouchEvent } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Flexbox, Icon, Image, Label } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import ImageDetailDialog from '@components/UI/organisms/ImageDetailDialog';

import { logEvent } from '@library/amplitude';

import { fetchProduct } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { scrollDisable, scrollEnable } from '@utils/scroll';
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
  const [openModal, setOpenModal] = useState(false);
  const [images, setImages] = useState<string[]>(tempData.images);

  const listRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const startDragIndexRef = useRef(-1);
  const draggingIndexRef = useRef(-1);
  const measureRef = useRef([0, 0]);
  const touchScrollLeftRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const maxScrollWidthRef = useRef(0);
  const prevDragDirectionRef = useRef('right');
  const prevTouchClientXRef = useRef(0);
  const scrollingRef = useRef(false);
  const listGapRef = useRef(8);
  const dummyDropElementIdRef = useRef('dummy-drop-element');

  const dragModeTransferTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const { data: editData, isLoading } = useQuery(
    queryKeys.products.sellerEditProduct({ productId, deviceId }),
    () => fetchProduct({ productId, deviceId }),
    {
      enabled: !!productId
    }
  );

  // 전환 판매자 매물
  const isExternalNormalSeller = editData?.product.productSeller.type === 4;

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

  const handleTouchStart = (index: number) => (e: TouchEvent<HTMLDivElement>) => {
    dragModeTransferTimerRef.current = setTimeout(() => {
      draggingRef.current = true;
      if (listRef.current) {
        listRef.current.style.overflowX = 'hidden';

        // TODO 사파리 환경에서 마지막 위치에 드랍하는 경우, 빈 영역으로 인지되어 자동 스크롤 오동작 하는 문제 임시 대응(추후 수정)
        if (index === images.length - 1) {
          const div = document.createElement('div');
          div.id = dummyDropElementIdRef.current;
          div.style.width = '84px';
          div.style.height = '84px';
          listRef.current.appendChild(div);
        }
      }
      scrollDisable();
    }, 800);

    startDragIndexRef.current = index;
    draggingIndexRef.current = index;

    const { offsetLeft, offsetTop, clientWidth } = e.currentTarget;
    const { clientX, clientY } = e.targetTouches[0];

    measureRef.current = [
      // 104: 첫번째 이미지 업로드 박스 + Gap 제외
      offsetLeft - clientX - 104 - clientWidth * index - listGapRef.current * index,
      // List Padding Top
      offsetTop - clientY - 20
    ];

    if (listRef.current) {
      const { scrollWidth, scrollLeft, clientWidth: listClientWidth } = listRef.current;
      maxScrollWidthRef.current = scrollWidth - listClientWidth;

      scrollLeftRef.current = scrollLeft;
    }
  };

  const handleTouchMove = (index: number) => (e: TouchEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;

    const { offsetParent, clientWidth } = e.currentTarget;
    const { clientX, clientY } = e.targetTouches[0];

    if (!offsetParent) return;

    Array.from(offsetParent.children)
      .filter((element) => element.getAttribute('draggable'))
      .forEach((element) => {
        const { offsetWidth } = element as HTMLDivElement;
        const dataIndex = Number(element.getAttribute('data-index'));
        const startX = element.getBoundingClientRect().x;
        const endX = element.clientWidth + element.getBoundingClientRect().x;

        if (clientX >= startX && clientX < endX && index !== dataIndex) {
          if (draggingIndexRef.current < dataIndex) {
            // TODO 사파리 환경에서 마지막 위치에 드랍하는 경우, 빈 영역으로 인지되어 자동 스크롤 오동작 하는 문제 임시 대응(추후 수정)
            if (dataIndex === images.length - 1 && listRef.current) {
              const hasDummyDrop = listRef.current.querySelector(
                `#${dummyDropElementIdRef.current}`
              );

              if (!hasDummyDrop) {
                const div = document.createElement('div');
                div.id = dummyDropElementIdRef.current;
                div.style.width = '84px';
                div.style.height = '84px';
                listRef.current.appendChild(div);
              }
            }

            element.setAttribute(
              'style',
              `transform: translateX(-${offsetWidth + listGapRef.current}px)`
            );
            draggingIndexRef.current = dataIndex;
            prevDragDirectionRef.current = 'right';
          } else if (draggingIndexRef.current > dataIndex) {
            element.setAttribute(
              'style',
              `transform: translateX(${offsetWidth + listGapRef.current}px)`
            );
            draggingIndexRef.current = dataIndex;
            prevDragDirectionRef.current = 'left';
          } else {
            element.removeAttribute('style');
            draggingIndexRef.current =
              prevDragDirectionRef.current === 'left' ? dataIndex + 1 : dataIndex - 1;
          }
        }

        if (listRef.current) {
          const { clientWidth: listClientWidth, scrollLeft } = listRef.current;

          // 사이드 감지에 따른 자동 스크롤
          if (
            clientX > listClientWidth - clientWidth &&
            scrollLeft < maxScrollWidthRef.current &&
            prevTouchClientXRef.current < clientX
          ) {
            touchScrollLeftRef.current += 1;
            scrollLeftRef.current += 1;
            listRef.current.scrollTo({
              top: 0,
              left: scrollLeftRef.current
            });
          } else if (clientX < clientWidth && scrollLeft && prevTouchClientXRef.current > clientX) {
            touchScrollLeftRef.current -= 1;
            scrollLeftRef.current -= 1;
            listRef.current.scrollTo({
              top: 0,
              left: scrollLeftRef.current
            });
          }
        }
      });

    e.currentTarget.style.zIndex = '10';
    e.currentTarget.style.transform = `translate(${
      clientX + measureRef.current[0] + touchScrollLeftRef.current
    }px, ${clientY + measureRef.current[1]}px)`;
    prevTouchClientXRef.current = clientX;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (dragModeTransferTimerRef.current) {
      clearTimeout(dragModeTransferTimerRef.current);

      draggingRef.current = false;
      scrollEnable();
    }

    if (listRef.current) {
      listRef.current.style.overflowX = 'auto';

      const copyImages = [...images];
      const dropImage = copyImages[startDragIndexRef.current];

      copyImages.splice(startDragIndexRef.current, 1);
      copyImages.splice(draggingIndexRef.current, 0, dropImage);

      setImages(copyImages);

      e.currentTarget.style.zIndex = 'inherit';
      e.currentTarget.style.transform = '';

      const { offsetParent } = e.currentTarget;

      if (!offsetParent) return;

      Array.from(offsetParent.children).forEach((element) => {
        element.removeAttribute('style');
      });

      draggingIndexRef.current = -1;
      touchScrollLeftRef.current = 0;
      scrollingRef.current = false;

      const div = listRef.current.querySelector(`#${dummyDropElementIdRef.current}`);
      if (div) listRef.current.removeChild(div);
    }
  };

  const handleScroll = () => {
    if (dragModeTransferTimerRef.current) {
      clearTimeout(dragModeTransferTimerRef.current);
    }
    scrollingRef.current = true;
  };

  const handleClickImage = (index: number) => (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (!draggingRef.current && !scrollingRef.current) {
      logEvent(attrKeys.camelSeller.CLICK_PIC, {
        name: attrProperty.name.PRODUCT_MAIN,
        title: attrProperty.title.GALLERY,
        index
      });

      setCurrentIndex(index);
      setOpenModal(true);
    }
  };

  useEffect(() => {
    window.getPhotoGuide = () => {
      setIsImageLoadingState(true);
    };

    window.getPhotoGuideDone = (result: { imageUrl: string }[]) => {
      const validImages = result
        .filter(({ imageUrl }) => !!imageUrl)
        .map(({ imageUrl }) => imageUrl);

      logEvent(attrKeys.camelSeller.LOAD_PHOTO_GUIDE, {
        name: attrProperty.name.PRODUCT_MAIN,
        title: attrProperty.title.PRODUCT_MAIN,
        count: validImages.length,
        data: result
      });

      setIsImageLoadingState(false);
      setTempData((prevState) => ({
        ...prevState,
        images: prevState.images.concat(validImages)
      }));
    };
  }, [setIsImageLoadingState, setTempData]);

  useEffect(() => {
    setImages(tempData.images);
  }, [tempData.images]);

  useEffect(() => {
    setTempData((prevState) => ({
      ...prevState,
      images
    }));
  }, [setTempData, images]);

  useEffect(() => {
    return () => {
      if (dragModeTransferTimerRef.current) {
        clearTimeout(dragModeTransferTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <List ref={listRef} onScroll={handleScroll} onContextMenu={(e) => e.preventDefault()}>
        {!isExternalNormalSeller && (
          <PhotoIconBox totalImageCount={10} count={images.length} onClick={handleClickPhoto} />
        )}
        {images.map((image, index) => (
          <ProductImageWrap
            // eslint-disable-next-line react/no-array-index-key
            key={`photo-guide-${index}-${image?.split('/')[image.split('/').length - 1]}`}
            // onClick={handleClickImage}
            draggable
            data-index={index}
            onTouchStart={handleTouchStart(index)}
            onTouchMove={handleTouchMove(index)}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              width={84}
              height={84}
              src={image}
              alt={image?.split('/')[image.split('/').length - 1]}
              round={8}
              onClick={handleClickImage(index)}
              disableOnBackground={false}
              disableAspectRatio
            />
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
              width={40}
              height="auto"
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/ico/photo_loading_fill.png`}
              alt="이미지 로딩중"
              disableAspectRatio
            />
          </Flexbox>
        )}
      </List>
      {!isLoading && (
        <ImageDetailDialog
          open={openModal}
          onClose={() => setOpenModal(false)}
          images={images.map((image) => image)}
          syncIndex={currentIndex}
        />
      )}
    </>
  );
}

const List = styled.div`
  position: relative;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  column-gap: 8px;
  margin: 0 -20px;
  padding: 20px 20px 0 20px;
  overflow-y: hidden;
  overflow-x: auto;
  user-select: none;
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
