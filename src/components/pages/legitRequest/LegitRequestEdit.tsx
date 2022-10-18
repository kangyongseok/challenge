import { useCallback, useEffect, useMemo, useState } from 'react';

import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import type { PhotoGuideImage, PostProductLegitData, PutProductLegitData } from '@dto/productLegit';

import { logEvent } from '@library/amplitude';

import { fetchProductLegit, putProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

import { productLegitEditParamsState } from '@recoil/legitRequest';
import { dialogState, toastState } from '@recoil/common';

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

  const setDialogState = useSetRecoilState(dialogState);

  const [hasPhotoLibraryAuth, setHasPhotoLibraryAuth] = useState(false);
  const [hasCameraAuth, setHasCameraAuth] = useState(false);

  useEffect(() => {
    logEvent(attrKeys.legit.VIEW_LEGIT_UPLOAD, { name: attrProperty.name.PRE_CONFIRM_EDIT });
  }, []);

  const productId = useMemo(() => Number(router.query?.productId || 0), [router.query?.productId]);
  const {
    data: {
      legitOpinions = [],
      productResult: {
        imageModel = '',
        brand: { name: brandName = '', nameEng: brandNameEng = '' } = {},
        category: { name: categoryName = '' } = {},
        photoGuideDetails = []
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
  const [productLegitEditParams, setProductLegitEditParamsState] = useRecoilState(
    productLegitEditParamsState
  );
  const setToastState = useSetRecoilState(toastState);
  const resetProductLegitEditParamsState = useResetRecoilState(productLegitEditParamsState);

  const { mutate: mutatePutProductLegit, isLoading: isLoadingMutate } = useMutation(
    putProductLegit,
    {
      onSettled() {
        resetProductLegitEditParamsState();
        setToastState({
          type: 'legit',
          status: 'successEdit'
        });
        router.push({ pathname: '/legit', query: { tab: 'my' } });
      }
    }
  );

  const [isLoadingGetPhoto, setIsLoadingGetPhoto] = useState(false);

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

  const handleClickPhotoGuide = useCallback(
    (index: number, isEdit = false) =>
      () => {
        logEvent(attrKeys.legit.CLICK_LEGIT_UPLOAD, { name: attrProperty.name.PRE_CONFIRM_EDIT });

        if (!hasPhotoLibraryAuth || !hasCameraAuth) {
          setDialogState({
            type: 'appAuthCheck',
            theme: 'dark',
            customStyleTitle: { minWidth: 269, marginTop: 12 },
            firstButtonAction: () => {
              if (
                checkAgent.isIOSApp() &&
                window.webkit &&
                window.webkit.messageHandlers &&
                window.webkit.messageHandlers.callMoveToSetting &&
                window.webkit.messageHandlers.callMoveToSetting.postMessage
              ) {
                window.webkit.messageHandlers.callMoveToSetting.postMessage(0);
              }
            }
          });
          return;
        }

        const [firstPhotoGuideDetail] = photoGuideDetails;

        if (
          checkAgent.isIOSApp() &&
          window.webkit &&
          window.webkit.messageHandlers &&
          window.webkit.messageHandlers.callPhotoGuide &&
          firstPhotoGuideDetail
        ) {
          window.webkit.messageHandlers.callPhotoGuide.postMessage(
            JSON.stringify({
              guideId: firstPhotoGuideDetail.commonPhotoGuideDetail.photoGuideId,
              viewMode: 'ALBUM',
              startId: index,
              isEdit,
              imageType: 3,
              images: photoGuideDetails.map(
                ({ imageUrl, isEdit: isEditPhotoGuide, commonPhotoGuideDetail: { id } }) => ({
                  photoGuideId: id,
                  isEdit: isEditPhotoGuide,
                  imageUrl: isEditPhotoGuide ? '' : imageUrl
                })
              )
            })
          );
        }
      },
    [setDialogState, hasCameraAuth, hasPhotoLibraryAuth, photoGuideDetails]
  );

  const handleSubmit = useCallback(() => {
    logEvent(attrKeys.legit.SUBMIT_LEGIT_PROCESS, {
      name: attrProperty.name.PRE_CONFIRM_EDIT,
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
      customStyle={{ height: 'auto', minHeight: '100%', backgroundColor: common.bg03 }}
    >
      {imageModel ? (
        <LegitRequestTitleWithModelImage
          brandLogo={`https://${process.env.IMAGE_DOMAIN}/assets/images/brands/black/${brandNameEng
            .toLocaleLowerCase()
            .split(' ')
            .join('')}.jpg`}
          brandName={brandName}
          categoryName={categoryName.replace(/\(P\)/g, '')}
          title={title}
          modelImage={imageModel}
        />
      ) : (
        <LegitRequestTitle
          brandLogo={`https://${process.env.IMAGE_DOMAIN}/assets/images/brands/black/${brandNameEng
            .toLocaleLowerCase()
            .split(' ')
            .join('')}.jpg`}
          brandName={brandName}
          categoryName={categoryName.replace(/\(P\)/g, '')}
          title={title}
        />
      )}
      <Contents>
        <LegitUploadPhoto
          isLoading={isLoadingGetPhoto}
          isEdit
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
        {legitOpinions.length > 0 && (
          <LegitRequestOpinion description={legitOpinions[0].description} />
        )}
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
        text="다시 감정요청하기"
        showTooltip={
          photoGuideImages.length > 0 &&
          (!isAllUploadRequiredPhoto || !isAllUploadRequestedEditPhoto)
        }
        tooltipMessage="감정사의 요청사진을 다시한번 업로드해주세요!"
      />
    </GeneralTemplate>
  );
}

const Contents = styled.section`
  display: flex;
  flex-direction: column;
  row-gap: 52px;
  padding: 32px 20px 52px;
  flex: 1;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg02};
`;

export default LegitRequestEdit;
