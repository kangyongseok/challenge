import { useCallback, useEffect, useMemo } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Flexbox, Grid, Image, Skeleton, Typography, useTheme } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import type { PostProductLegitData } from '@dto/productLegit';

import { logEvent } from '@library/amplitude';

import { fetchLegitsModels } from '@api/model';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { legitRequestState, productLegitParamsState } from '@recoil/legitRequest';

function LegitRequestSelectModel() {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [{ brandId, categoryId, productId }, setLegitRequestState] =
    useRecoilState(legitRequestState);
  const setProductLegitParamsState = useSetRecoilState(productLegitParamsState);

  const modelsSuggestParams = useMemo(
    () => ({ categoryIds: [categoryId], brandIds: [brandId] }),
    [brandId, categoryId]
  );
  const { data: models = [], isLoading } = useQuery(
    queryKeys.models.legitsModels(modelsSuggestParams),
    () => fetchLegitsModels(modelsSuggestParams)
  );

  const handleClickModel = useCallback(
    ({
        legitCategoryId,
        legitBrandId,
        modelId,
        title,
        modelImage
      }: {
        title: string;
        legitCategoryId?: number;
        legitBrandId?: number;
        modelId: number;
        modelImage: string;
      }) =>
      () => {
        logEvent(attrKeys.legit.CLICK_LEGIT_MODEL, {
          name: attrProperty.legitName.LEGIT_PROCESS,
          att: title
        });

        if (modelImage) {
          setLegitRequestState((currVal) => ({
            ...currVal,
            modelImage,
            isViewedSampleGuide: !!currVal?.productId
          }));
        } else {
          setLegitRequestState((currVal) => ({
            ...currVal,
            isViewedSampleGuide: !!currVal?.productId
          }));
        }

        const newProductLegitParamsState: PostProductLegitData = {
          title,
          categoryIds: [legitCategoryId || categoryId],
          brandIds: [legitBrandId || brandId],
          photoGuideImages: []
        };

        if (modelId) newProductLegitParamsState.modelId = modelId;

        if (productId) newProductLegitParamsState.productId = productId;

        setProductLegitParamsState(newProductLegitParamsState);
        router.push('/legit/request/form', undefined, { shallow: true });
      },
    [brandId, categoryId, productId, router, setLegitRequestState, setProductLegitParamsState]
  );

  useEffect(() => {
    logEvent(attrKeys.legit.VIEW_LEGIT_MODEL, {
      name: attrProperty.legitName.LEGIT_PROCESS
    });
  }, []);

  return (
    <GeneralTemplate
      header={<Header showRight={false} hideTitle customStyle={{ backgroundColor: common.bg03 }} />}
      customStyle={{
        height: 'auto',
        minHeight: '100%',
        backgroundColor: common.bg03,
        '& > main': { padding: '28px 0', rowGap: 32 },
        overflowX: 'hidden'
      }}
    >
      <Flexbox
        component="section"
        direction="vertical"
        gap={8}
        customStyle={{ padding: '0 20px', userSelect: 'none' }}
      >
        <Typography variant="h2" weight="bold">
          모델을 선택해주세요
        </Typography>
        <Typography variant="h4" customStyle={{ color: common.ui60 }}>
          똑같지 않아도 괜찮아요! 가장 비슷한 모델도 괜찮아요!
        </Typography>
      </Flexbox>
      <Grid container columnGap={12} rowGap={12} customStyle={{ padding: '0 20px' }}>
        {isLoading ? (
          Array.from({ length: 9 }, (_, index) => (
            <Grid key={`model-skeleton-${index}`} item xs={3}>
              <Model key={`model-skeleton-${index}`}>
                <Skeleton width={72} height={72} round={8} disableAspectRatio />
                <Skeleton width={72} height={16} round={8} disableAspectRatio />
              </Model>
            </Grid>
          ))
        ) : (
          <>
            {models.map(
              ({
                id,
                name,
                categoryId: legitCategoryId,
                brandId: legitBrandId,
                imageThumbnail
              }) => (
                <Grid key={`model-${name}`} item xs={3}>
                  <Model
                    onClick={handleClickModel({
                      legitCategoryId,
                      legitBrandId,
                      modelId: id,
                      title: name,
                      modelImage: imageThumbnail
                    })}
                  >
                    <Image
                      src={imageThumbnail}
                      alt="Thumbnail Img"
                      width={72}
                      height={72}
                      round={8}
                      disableAspectRatio
                      customStyle={{ margin: '0 auto' }}
                    />
                    <Name variant="body2">{name}</Name>
                  </Model>
                </Grid>
              )
            )}
          </>
        )}
      </Grid>
    </GeneralTemplate>
  );
}

const Model = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  padding: 12px 8px 20px;
  border: 1px solid ${({ theme: { palette } }) => palette.common.line01};
  border-radius: 8px;
  max-height: 144px;
  cursor: pointer;

  & > div:first-of-type {
    margin: 0 auto;
  }
`;

const Name = styled(Typography)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 32px;
  text-align: center;
  word-break: keep-all;
`;

export default LegitRequestSelectModel;
