import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState } from 'recoil';
import { useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { dark } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import type { PhotoGuideImage, PostProductLegitData } from '@dto/productLegit';
import type { PhotoGuideParams } from '@dto/common';

import { logEvent } from '@library/amplitude';

import { postProductLegit } from '@api/productLegit';
import { fetchPhotoGuide } from '@api/common';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

import { legitRequestState, productLegitParamsState } from '@recoil/legitRequest';

import LegitUploadPhoto from './LegitUploadPhoto';
import LegitSelectAdditionalInfo from './LegitSelectAdditionalInfo';
import LegitRequestTitleWithModelImage from './LegitRequestTitleWithModelImage';
import LegitRequestTitle from './LegitRequestTitle';
import LegitRequestBottomButton from './LegitRequestBottomButton';

function LegitRequestForm() {
  const router = useRouter();

  const [{ categoryName, brandName, brandLogo, modelImage, isCompleted }, setLegitRequestState] =
    useRecoilState(legitRequestState);
  const [productLegitParams, setProductLegitParamsState] = useRecoilState(productLegitParamsState);

  const [isLoadingGetPhoto, setIsLoadingGetPhoto] = useState(false);

  const { title, photoGuideImages, description, additionalIds = [] } = productLegitParams;

  useEffect(() => {
    logEvent(attrKeys.legit.VIEW_LEGIT_UPLOAD, {
      name: attrProperty.legitName.LEGIT_PROCESS
    });
  }, []);

  const photoGuideParams: PhotoGuideParams = useMemo(
    () => ({
      type: 1,
      categoryId: productLegitParams.categoryIds[0],
      brandId: productLegitParams.brandIds[0]
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

      if (
        checkAgent.isIOSApp() &&
        window.webkit &&
        window.webkit.messageHandlers &&
        window.webkit.messageHandlers.callPhotoGuide
      ) {
        window.webkit.messageHandlers.callPhotoGuide.postMessage(
          JSON.stringify({
            guideId: groupId,
            viewMode: 'ALBUM',
            startId: index,
            imageType: 2,
            images: photoGuideImages
          })
        );
      }
    },
    [groupId, photoGuideImages]
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
    logEvent(attrKeys.legit.SUBMIT_LEGIT_PROCESS, {
      name: attrProperty.legitName.AUTHORIZED,
      data: productLegitParams
    });

    if (isCompleted || isLoadingGetPhoto || isLoadingMutate) return;

    mutatePostProductLegit(productLegitParams);
  }, [isCompleted, isLoadingGetPhoto, isLoadingMutate, mutatePostProductLegit, productLegitParams]);

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

  return (
    <GeneralTemplate
      header={<Header showRight={false} hideTitle isFixed={false} />}
      disablePadding
      customStyle={{ height: 'auto', minHeight: '100%', backgroundColor: dark.palette.common.bg03 }}
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
          photoGuideDetails={photoGuideDetails}
          photoGuideImages={photoGuideImages}
          onClick={handleClickPhotoGuide}
        />
        <LegitSelectAdditionalInfo
          additionalIds={additionalIds}
          description={description}
          onclickAdditionalInfo={handleClickAdditionalInfo}
          onChangeDescription={handleChangeDescription}
        />
      </Contents>
      <LegitRequestBottomButton
        onClick={handleSubmit}
        disabled={isCompleted || isLoadingGetPhoto || isLoadingMutate || !isAllUploadRequiredPhoto}
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
  padding: 32px 20px 52px;
  flex: 1;
  background-color: ${dark.palette.common.bg02};
`;

export default LegitRequestForm;
