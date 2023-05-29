import { useCallback, useEffect, useMemo, useState } from 'react';

import { useRecoilState, useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { AppAuthCheckDialog } from '@components/UI/organisms';
import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import type { PhotoGuideImage, PostProductLegitData, PutProductLegitData } from '@dto/productLegit';
import type { PhotoGuideParams } from '@dto/common';

import { logEvent } from '@library/amplitude';

import { fetchProductLegit, putProductLegit } from '@api/productLegit';
import { fetchPhotoGuide } from '@api/common';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

import { productLegitEditParamsState } from '@recoil/legitRequest';

import LegitUploadPhoto from './LegitUploadPhoto';
import LegitRequestTitleWithModelImage from './LegitRequestTitleWithModelImage';
import LegitRequestTitle from './LegitRequestTitle';
import LegitRequestOpinion from './LegitRequestOpinion';
import LegitRequestBottomButton from './LegitRequestBottomButton';

function LegitRequestEdit() {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const toastStack = useToastStack();

  const [open, setOpen] = useState(false);

  const [productLegitEditParams, setProductLegitEditParamsState] = useRecoilState(
    productLegitEditParamsState
  );
  const resetProductLegitEditParamsState = useResetRecoilState(productLegitEditParamsState);

  const productId = useMemo(() => Number(router.query?.productId || 0), [router.query?.productId]);
  const {
    data: {
      legitOpinions = [],
      productResult: {
        imageModel = '',
        brand: { id: brandId = 0, name: brandName = '', nameEng: brandNameEng = '' } = {},
        category: { id: categoryId = 0, name: categoryName = '' } = {},
        photoGuideDetails = [],
        sellerType = 0,
        status = 0
      } = {}
    } = {},
    isLoading: isLoadingProductLegit
  } = useQuery(queryKeys.productLegits.legit(productId), () => fetchProductLegit(productId), {
    enabled: !!productId,
    refetchOnMount: true,
    onSuccess(data) {
      if (data) {
        const newProductLegitEditParamsState: PutProductLegitData = {
          productId: data.productId,
          title: data.productResult.title,
          brandIds: [data.productResult.brand.id],
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          categoryIds: [data.productResult.category.id!],
          photoGuideImages: data.productResult.photoGuideDetails
            .map(({ commonPhotoGuideDetail: { id }, imageUrl }) => ({ photoGuideId: id, imageUrl }))
            .filter(({ imageUrl }) => imageUrl.length > 0)
        };

        if (data.description) {
          newProductLegitEditParamsState.description = data.description;
        }

        if (data.additionalIds) {
          newProductLegitEditParamsState.additionalIds =
            data.additionalIds as PostProductLegitData['additionalIds'];
        }

        setProductLegitEditParamsState(newProductLegitEditParamsState);
      }
    }
  });

  const photoGuideParams: PhotoGuideParams = useMemo(
    () => ({ type: 1, brandId, categoryId }),
    [brandId, categoryId]
  );
  const {
    isLoading: isLoadingSamplePhotoGuideDetails,
    data: { photoGuideDetails: samplePhotoGuideDetails = [] } = {}
  } = useQuery(queryKeys.commons.photoGuide(photoGuideParams), () =>
    fetchPhotoGuide(photoGuideParams)
  );

  const { mutate: mutatePutProductLegit, isLoading: isLoadingMutate } = useMutation(
    putProductLegit,
    {
      onSettled() {
        resetProductLegitEditParamsState();
        toastStack({
          children: '수정이 완료되어 다시 감정에 들어갑니다!'
        });
        router.push({ pathname: '/legit', query: { tab: 'my' } });
      }
    }
  );

  const [isLoadingGetPhoto, setIsLoadingGetPhoto] = useState(false);
  const [hasPhotoLibraryAuth, setHasPhotoLibraryAuth] = useState(false);
  const [hasCameraAuth, setHasCameraAuth] = useState(false);

  useEffect(() => {
    logEvent(attrKeys.legit.VIEW_LEGIT_UPLOAD, { name: attrProperty.name.PRE_CONFIRM_EDIT });
  }, []);

  const { title, photoGuideImages } = productLegitEditParams;

  const isAllUploadRequiredPhoto = useMemo(
    () =>
      photoGuideDetails
        .filter(({ commonPhotoGuideDetail: { isRequired } }) => isRequired)
        .every(({ commonPhotoGuideDetail: { id } }) =>
          photoGuideImages.some(({ photoGuideId }) => photoGuideId === id)
        ),
    [photoGuideDetails, photoGuideImages]
  );

  const isAllUploadRequestedEditPhoto = useMemo(
    () =>
      photoGuideDetails
        .filter(({ isEdit }) => isEdit)
        .every(({ commonPhotoGuideDetail: { id }, imageUrl: savedImageUrl }) =>
          photoGuideImages.some(
            ({ photoGuideId, imageUrl }) => photoGuideId === id && savedImageUrl !== imageUrl
          )
        ),
    [photoGuideDetails, photoGuideImages]
  );

  const handleClickSamplePhotoGuide = useCallback(() => {
    router.push({
      pathname: '/legit/guide/sample',
      query: {
        brandId: photoGuideParams.brandId,
        categoryId: photoGuideParams.categoryId
      }
    });
  }, [photoGuideParams.brandId, photoGuideParams.categoryId, router]);

  const handleClickPhotoGuide = useCallback(
    (index: number, isEdit = false) =>
      () => {
        logEvent(attrKeys.legit.CLICK_LEGIT_UPLOAD, { name: attrProperty.name.PRE_CONFIRM_EDIT });

        if (!checkAgent.isAndroidApp() && (!hasPhotoLibraryAuth || !hasCameraAuth)) {
          setOpen(true);
          return;
        }

        const [firstPhotoGuideDetail] = photoGuideDetails;

        if (checkAgent.isIOSApp() && firstPhotoGuideDetail) {
          window.webkit?.messageHandlers?.callPhotoGuide?.postMessage?.(
            JSON.stringify({
              guideId: firstPhotoGuideDetail.commonPhotoGuideDetail.photoGuideId,
              viewMode: 'ALBUM',
              startId: index,
              isEdit,
              imageType: 3,
              images: photoGuideDetails.map(
                ({
                  imageUrl: savedImageUrl,
                  isEdit: isEditPhotoGuide,
                  commonPhotoGuideDetail: { id }
                }) => {
                  const findEditedPhotoGuide = photoGuideImages.find(
                    ({ photoGuideId, imageUrl }) =>
                      photoGuideId === id && savedImageUrl !== imageUrl
                  );
                  let newImageUrl = isEditPhotoGuide ? '' : savedImageUrl;

                  if (findEditedPhotoGuide) {
                    newImageUrl = findEditedPhotoGuide.imageUrl;
                  }

                  return {
                    photoGuideId: id,
                    isEdit: findEditedPhotoGuide ? false : isEditPhotoGuide,
                    imageUrl: newImageUrl
                  };
                }
              ),
              isRequired: sellerType !== 0 && status !== 7
            })
          );
        }

        if (checkAgent.isAndroidApp() && firstPhotoGuideDetail) {
          window.webview?.callPhotoGuide?.(
            firstPhotoGuideDetail.commonPhotoGuideDetail.photoGuideId,
            JSON.stringify({
              viewMode: 'ALBUM',
              startId: index,
              isEdit,
              imageType: 3,
              images: photoGuideDetails.map(
                ({
                  imageUrl: savedImageUrl,
                  isEdit: isEditPhotoGuide,
                  commonPhotoGuideDetail: { id }
                }) => {
                  const findEditedPhotoGuide = photoGuideImages.find(
                    ({ photoGuideId, imageUrl }) =>
                      photoGuideId === id && savedImageUrl !== imageUrl
                  );
                  let newImageUrl = isEditPhotoGuide ? '' : savedImageUrl;

                  if (findEditedPhotoGuide) {
                    newImageUrl = findEditedPhotoGuide.imageUrl;
                  }

                  return {
                    photoGuideId: id,
                    isEdit: findEditedPhotoGuide ? false : isEditPhotoGuide,
                    imageUrl: newImageUrl
                  };
                }
              ),
              isRequired: sellerType !== 0 && status !== 7
            })
          );
        }
      },
    [hasPhotoLibraryAuth, hasCameraAuth, photoGuideDetails, sellerType, status, photoGuideImages]
  );

  const handleSubmit = useCallback(() => {
    logEvent(attrKeys.legit.SUBMIT_LEGIT_PROCESS, {
      name: attrProperty.name.PRE_CONFIRM_EDIT,
      type: 'EDIT',
      att: '사진으로 감정신청'
    });

    if (
      isLoadingProductLegit ||
      isLoadingGetPhoto ||
      isLoadingMutate ||
      !isAllUploadRequiredPhoto ||
      !isAllUploadRequestedEditPhoto
    )
      return;

    mutatePutProductLegit(productLegitEditParams);
  }, [
    isAllUploadRequestedEditPhoto,
    isAllUploadRequiredPhoto,
    isLoadingGetPhoto,
    isLoadingMutate,
    isLoadingProductLegit,
    mutatePutProductLegit,
    productLegitEditParams
  ]);

  useEffect(() => {
    if (!productId) router.replace({ pathname: '/legit', query: { tab: 'my' } });
  }, [productId, router]);

  useEffect(() => {
    window.getPhotoGuide = () => {
      setIsLoadingGetPhoto(true);
    };
    window.getPhotoGuideDone = (photoGuideImagesData: PhotoGuideImage[]) => {
      if (photoGuideImagesData) {
        setProductLegitEditParamsState((currVal) => ({
          ...currVal,
          photoGuideImages: photoGuideImagesData.filter(({ imageUrl }) => imageUrl.length > 0)
        }));
      }

      setTimeout(() => setIsLoadingGetPhoto(false), 500);
    };
  }, [setProductLegitEditParamsState]);

  useEffect(() => {
    window.getAuthPhotoLibrary = (result: boolean) => {
      setHasPhotoLibraryAuth(result);
    };
    window.getAuthCamera = (result: boolean) => {
      setHasCameraAuth(result);
    };
    if (
      checkAgent.isIOSApp() &&
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.callAuthPhotoLibrary
    ) {
      window.webkit.messageHandlers.callAuthPhotoLibrary.postMessage(0);
    }
    if (
      checkAgent.isIOSApp() &&
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.callAuthCamera
    ) {
      window.webkit.messageHandlers.callAuthCamera.postMessage(0);
    }
  }, []);

  return (
    <>
      <GeneralTemplate
        header={
          <Header
            showRight={false}
            hideTitle
            isFixed={false}
            customStyle={{ backgroundColor: common.bg03 }}
          />
        }
        disablePadding
        customStyle={{
          height: 'auto',
          minHeight: '100%',
          backgroundColor: common.bg03
        }}
      >
        {imageModel ? (
          <LegitRequestTitleWithModelImage
            brandLogo={`https://${
              process.env.IMAGE_DOMAIN
            }/assets/images/brands/transparent/${brandNameEng
              .toLocaleLowerCase()
              .split(' ')
              .join('')}.png`}
            brandName={brandName}
            categoryName={categoryName.replace(/\(P\)/g, '')}
            title={title}
            modelImage={imageModel}
            isEditMode
          />
        ) : (
          <LegitRequestTitle
            brandLogo={`https://${
              process.env.IMAGE_DOMAIN
            }/assets/images/brands/transparent/${brandNameEng
              .toLocaleLowerCase()
              .split(' ')
              .join('')}.png`}
            brandName={brandName}
            categoryName={categoryName.replace(/\(P\)/g, '')}
            title={title}
            isEditMode
          />
        )}
        <Contents>
          <LegitRequestOpinion
            isLoading={isLoadingSamplePhotoGuideDetails}
            description={legitOpinions[0]?.description || ''}
            samplePhotoGuideDetails={samplePhotoGuideDetails.filter(({ isRequired }) => isRequired)}
            onClickSamplePhotoGuide={handleClickSamplePhotoGuide}
          />
          <LegitUploadPhoto
            isLoading={isLoadingGetPhoto}
            mode="edit"
            showPhotoGuide={false}
            photoGuideDetails={photoGuideDetails.map(
              ({ commonPhotoGuideDetail, imageUrl, isEdit }) => ({
                ...commonPhotoGuideDetail,
                isEdit,
                savedImageUrl: imageUrl
              })
            )}
            photoGuideImages={photoGuideImages}
            onClick={handleClickPhotoGuide}
          />
        </Contents>
        <LegitRequestBottomButton
          onClick={handleSubmit}
          disabled={
            isLoadingProductLegit ||
            isLoadingGetPhoto ||
            isLoadingMutate ||
            !isAllUploadRequiredPhoto ||
            !isAllUploadRequestedEditPhoto
          }
          text="사진 보완 완료"
          showTooltip={
            photoGuideImages.length > 0 &&
            (!isAllUploadRequiredPhoto || !isAllUploadRequestedEditPhoto)
          }
          tooltipMessage="감정사의 요청사진을 다시한번 업로드해주세요!"
        />
      </GeneralTemplate>
      <AppAuthCheckDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const Contents = styled.section`
  display: flex;
  flex-direction: column;
  row-gap: 52px;
  padding: 14px 20px 52px;
  flex: 1;
`;

export default LegitRequestEdit;
