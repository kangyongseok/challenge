import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useTheme } from 'mrcamel-ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import type { PhotoGuideImage, PostProductLegitData } from '@dto/productLegit';
import type { PhotoGuideParams } from '@dto/common';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { postProductLegit } from '@api/productLegit';
import { fetchPhotoGuide } from '@api/common';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { LISTING_TECH_LEGIT_DATE, SAVED_LEGIT_REQUEST_STATE } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

import { legitRequestState, productLegitParamsState } from '@recoil/legitRequest';
import { dialogState } from '@recoil/common';
import useQueryUserData from '@hooks/useQueryUserData';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import LegitUploadPhoto from './LegitUploadPhoto';
import LegitSelectAdditionalInfo from './LegitSelectAdditionalInfo';
import LegitRequestTitleWithModelImage from './LegitRequestTitleWithModelImage';
import LegitRequestTitle from './LegitRequestTitle';
import LegitRequestBottomButton from './LegitRequestBottomButton';

function LegitRequestForm() {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();
  const { set: setUserData } = useQueryUserData();

  const [legitRequest, setLegitRequestState] = useRecoilState(legitRequestState);
  const [productLegitParams, setProductLegitParamsState] = useRecoilState(productLegitParamsState);
  const setDialogState = useSetRecoilState(dialogState);

  const [isLoadingGetPhoto, setIsLoadingGetPhoto] = useState(false);
  const [hasPhotoLibraryAuth, setHasPhotoLibraryAuth] = useState(false);
  const [hasCameraAuth, setHasCameraAuth] = useState(false);

  const {
    categoryName,
    brandName,
    brandLogo,
    modelImage,
    isCompleted,
    isViewedSampleGuide,
    productId
  } = legitRequest;
  const { title, photoGuideImages, description, additionalIds = [] } = productLegitParams;
  const isRegisteredProduct = isViewedSampleGuide && !!productId;

  const photoGuideParams: PhotoGuideParams = useMemo(
    () => ({
      type: 1,
      brandId: productLegitParams.brandIds[0],
      categoryId: productLegitParams.categoryIds[0]
    }),
    [productLegitParams.brandIds, productLegitParams.categoryIds]
  );
  const { data: { groupId = 1, photoGuideDetails = [] } = {} } = useQuery(
    queryKeys.commons.photoGuide(photoGuideParams),
    () => fetchPhotoGuide(photoGuideParams)
  );
  const { mutate: mutatePostProductLegit, isLoading: isLoadingMutate } = useMutation(
    postProductLegit,
    {
      onSuccess(id) {
        setLegitRequestState((currVal) => ({ ...currVal, isCompleted: true }));
        LocalStorage.remove(String(accessUser?.userId || ''));
        LocalStorage.remove(LISTING_TECH_LEGIT_DATE);
        router.push({ pathname: '/legit/request', query: { id } });
      }
    }
  );

  const isAllUploadRequiredPhoto = useMemo(
    () =>
      photoGuideDetails
        .filter(({ isRequired }) => isRequired)
        .every(({ id }) => photoGuideImages.some(({ photoGuideId }) => photoGuideId === id)),
    [photoGuideDetails, photoGuideImages]
  );

  const handleClickPhotoGuide = useCallback(
    (index: number) => () => {
      logEvent(attrKeys.legit.CLICK_LEGIT_UPLOAD, {
        name: attrProperty.legitName.LEGIT_PROCESS
      });

      if (!checkAgent.isAndroidApp() && (!hasPhotoLibraryAuth || !hasCameraAuth)) {
        setDialogState({
          type: 'legitPermissionCheck',
          theme: 'dark',
          customStyleTitle: { minWidth: 270 },
          onClose() {
            setLegitRequestState((prevState) => ({
              ...prevState,
              isViewedSampleGuide: true
            }));
          },
          secondButtonAction: () => {
            if (accessUser?.userId)
              setUserData({
                [SAVED_LEGIT_REQUEST_STATE]: {
                  state: legitRequest,
                  params: productLegitParams
                }
              });

            if (checkAgent.isIOSApp())
              window.webkit?.messageHandlers?.callMoveToSetting?.postMessage(0);

            if (checkAgent.isAndroidApp()) window.webview?.moveToSetting?.();
          }
        });
        return;
      }

      if (checkAgent.isIOSApp())
        window.webkit?.messageHandlers?.callPhotoGuide?.postMessage(
          JSON.stringify({
            guideId: groupId,
            viewMode: 'ALBUM',
            startId: index,
            imageType: 2,
            images: photoGuideImages,
            isRequired: !!legitRequest.productId
          })
        );

      if (checkAgent.isAndroidApp())
        window.webview?.callPhotoGuide?.(
          groupId,
          JSON.stringify({
            viewMode: 'ALBUM',
            startId: index,
            imageType: 2,
            images: photoGuideImages,
            isRequired: !!legitRequest.productId
          })
        );
    },
    [
      hasPhotoLibraryAuth,
      hasCameraAuth,
      setDialogState,
      setLegitRequestState,
      accessUser?.userId,
      setUserData,
      legitRequest,
      productLegitParams,
      groupId,
      photoGuideImages
    ]
  );

  const handleClickAdditionalInfo = useCallback(
    (id: keyof PostProductLegitData['additionalIds'], label: string) => () => {
      logEvent(attrKeys.legit.CLICK_LEGIT_ADDINFO, {
        name: attrProperty.legitName.LEGIT_PROCESS,
        att: label
      });

      setProductLegitParamsState(({ additionalIds: prevAdditionalIds = [], ...currVal }) => ({
        ...currVal,
        additionalIds: prevAdditionalIds.includes(id)
          ? prevAdditionalIds.filter((prevAdditionalId) => prevAdditionalId !== id)
          : prevAdditionalIds.concat([id])
      }));
    },
    [setProductLegitParamsState]
  );

  const handleChangeDescription = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) =>
      setProductLegitParamsState((currVal) => ({
        ...currVal,
        description: e.target.value.substring(0, 300)
      })),
    [setProductLegitParamsState]
  );

  const handleSubmit = useCallback(() => {
    const name = SessionStorage.get(sessionStorageKeys.submitLegitProcessName);

    if (name) {
      logEvent(attrKeys.legit.SUBMIT_LEGIT_PROCESS, {
        name,
        type: 'USER_PRODUCT',
        data: productLegitParams
      });
    } else {
      logEvent(attrKeys.legit.SUBMIT_LEGIT_PROCESS, {
        name: attrProperty.legitName.AUTHORIZED,
        type: 'AUTHORIZED',
        data: productLegitParams
      });
    }

    if (isCompleted || isLoadingGetPhoto || isLoadingMutate) return;

    mutatePostProductLegit(productLegitParams);
  }, [isCompleted, isLoadingGetPhoto, isLoadingMutate, mutatePostProductLegit, productLegitParams]);

  useEffect(() => {
    if (isViewedSampleGuide || !photoGuideDetails.filter(({ imageSample }) => imageSample).length)
      return;

    setDialogState({
      type: 'legitSampleGuid',
      theme: 'dark',
      customStyleTitle: { minWidth: 270 },
      onClose() {
        setLegitRequestState((prevState) => ({
          ...prevState,
          isViewedSampleGuide: true
        }));
      },
      secondButtonAction: () => {
        logEvent(attrKeys.legit.CLICK_UPLOAD_GUIDE, {
          name: attrProperty.name.LEGIT_UPLOAD,
          title: attrProperty.title.POPUP
        });
        setLegitRequestState((prevState) => ({
          ...prevState,
          isViewedSampleGuide: true
        }));
        router.push({
          pathname: '/legit/guide/sample',
          query: { ...photoGuideParams }
        });
      }
    });
  }, [
    setLegitRequestState,
    setDialogState,
    router,
    photoGuideParams,
    isViewedSampleGuide,
    photoGuideDetails
  ]);

  useEffect(() => {
    logEvent(attrKeys.legit.VIEW_LEGIT_UPLOAD, {
      name: attrProperty.legitName.LEGIT_PROCESS
    });
  }, []);

  useEffect(() => {
    window.getPhotoGuide = () => {
      setIsLoadingGetPhoto(true);
    };
    window.getPhotoGuideDone = (photoGuideImagesData: PhotoGuideImage[]) => {
      if (photoGuideImagesData) {
        setProductLegitParamsState((currVal) => ({
          ...currVal,
          photoGuideImages: photoGuideImagesData.filter(({ imageUrl }) => imageUrl.length > 0)
        }));
      }

      setTimeout(() => setIsLoadingGetPhoto(false), 500);
    };
  }, [setProductLegitParamsState]);

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
      {productLegitParams.modelId ? (
        <LegitRequestTitleWithModelImage
          brandLogo={brandLogo}
          brandName={brandName}
          categoryName={categoryName.replace(/\(P\)/g, '')}
          title={title}
          modelImage={modelImage}
        />
      ) : (
        <LegitRequestTitle
          brandLogo={brandLogo}
          brandName={brandName}
          categoryName={categoryName.replace(/\(P\)/g, '')}
          title={title}
        />
      )}
      <Contents>
        <LegitUploadPhoto
          isLoading={isLoadingGetPhoto}
          showBanner={isRegisteredProduct}
          showPhotoGuide={!isRegisteredProduct}
          photoGuideDetails={photoGuideDetails.filter(
            ({ isRequired }) => (!!legitRequest.productId && isRequired) || !legitRequest.productId
          )}
          photoGuideImages={photoGuideImages}
          onClick={handleClickPhotoGuide}
        />
        {!isRegisteredProduct && (
          <LegitSelectAdditionalInfo
            additionalIds={additionalIds}
            description={description}
            onclickAdditionalInfo={handleClickAdditionalInfo}
            onChangeDescription={handleChangeDescription}
          />
        )}
      </Contents>
      <LegitRequestBottomButton
        onClick={handleSubmit}
        disabled={
          isCompleted ||
          isLoadingGetPhoto ||
          isLoadingMutate ||
          !isAllUploadRequiredPhoto ||
          !photoGuideImages.length
        }
        text="감정 신청하기"
        showTooltip={photoGuideImages.length > 0 && !isAllUploadRequiredPhoto}
        tooltipMessage="필수입력 사진을 올려주세요!"
      />
    </GeneralTemplate>
  );
}

const Contents = styled.section`
  display: flex;
  flex-direction: column;
  row-gap: 52px;
  padding: 60px 20px 52px;
  flex: 1;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg02};
`;

export default LegitRequestForm;
