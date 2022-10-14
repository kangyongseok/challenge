import { useEffect, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { BottomSheet, Box, Button, Flexbox, Grid, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import LegitPhotoGuideCard from '@components/UI/molecules/LegitPhotoGuideCard';

import {
  deleteProductLegitOpinion,
  fetchProductLegit,
  postProductLegitOpinion,
  postProductLegitPreConfirmEdit,
  putProductLegitOpinion
} from '@api/productLegit';

import queryKeys from '@constants/queryKeys';

import {
  legitAdminOpinionDataState,
  legitAdminOpinionEditableState
} from '@recoil/legitAdminOpinion/atom';
import { dialogState, toastState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function LegitAdminRequestCtaButton() {
  const router = useRouter();
  const { id } = router.query;

  const { result, description } = useRecoilValue(legitAdminOpinionDataState);
  const editable = useRecoilValue(legitAdminOpinionEditableState);
  const setLegitAdminOpinionEditableState = useSetRecoilState(legitAdminOpinionEditableState);
  const setToastState = useSetRecoilState(toastState);
  const setDialogState = useSetRecoilState(dialogState);
  const resetLegitAdminOpinionDataState = useResetRecoilState(legitAdminOpinionDataState);

  const { data: accessUser } = useQueryAccessUser();

  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [selectedPhotoGuideDetailIds, setSelectedPhotoGuideDetailIds] = useState<number[]>([]);

  const {
    data: {
      status,
      productResult: { postType = 0, photoGuideDetails = [] } = {},
      legitOpinions = [],
      isLegitHead
    } = {},
    refetch
  } = useQuery(queryKeys.productLegits.legit(Number(id)), () => fetchProductLegit(Number(id)), {
    enabled: !!id
  });

  const { mutate } = useMutation(postProductLegitOpinion);
  const { mutate: editMutate } = useMutation(putProductLegitOpinion);
  const { mutate: deleteMutate } = useMutation(deleteProductLegitOpinion);
  const { mutate: preConfirmMutate } = useMutation(postProductLegitPreConfirmEdit);

  const myLegitOpinion = useMemo(
    () => legitOpinions.find(({ roleLegit: { userId } }) => userId === (accessUser || {}).userId),
    [legitOpinions, accessUser]
  );

  const handleClick = () => {
    if (myLegitOpinion) {
      router.push({
        pathname: '/legit/admin',
        query: {
          tab: 'request'
        }
      });
    } else if (postType === 2 && result === 3) {
      setOpen(true);
    } else {
      mutate(
        {
          productId: Number(id),
          result,
          description
        },
        {
          onSuccess: () => {
            router
              .push({
                pathname: '/legit/admin',
                query: {
                  tab: 'request'
                }
              })
              .then(() => {
                if (result === 3) {
                  setToastState({
                    type: 'legitAdminOpinion',
                    status: 'preConfirmEdited'
                  });
                } else {
                  setToastState({
                    type: 'legitAdminOpinion',
                    status: 'saved'
                  });
                }
              });
          }
        }
      );
    }
  };

  const handleClickEditComplete = () => {
    if (!myLegitOpinion) return;

    editMutate(
      {
        productId: Number(id),
        opinionId: myLegitOpinion.id,
        result,
        description
      },
      {
        onSuccess: () => {
          refetch();
          setLegitAdminOpinionEditableState(false);
          resetLegitAdminOpinionDataState();
        }
      }
    );
  };

  const handleClickDeleteConfirm = () => {
    if (!myLegitOpinion) return;

    deleteMutate(
      {
        productId: Number(id),
        opinionId: myLegitOpinion.id
      },
      {
        onSuccess: () => {
          refetch();
          resetLegitAdminOpinionDataState();
        }
      }
    );
  };

  const handleClickPreConfirmEditConfirm = () => {
    preConfirmMutate(
      {
        productId: Number(id),
        photoGuideIds: selectedPhotoGuideDetailIds
      },
      {
        onSuccess: () =>
          router
            .push({
              pathname: '/legit/admin',
              query: {
                tab: 'request'
              }
            })
            .then(() =>
              setToastState({
                type: 'legitAdminOpinion',
                status: 'preConfirmEdited'
              })
            )
      }
    );
  };

  const handleClickPhotoGuideDetail = (e: MouseEvent<HTMLDivElement>) => {
    const dataId = Number(e.currentTarget.getAttribute('data-id') || 0);
    setSelectedPhotoGuideDetailIds(
      !selectedPhotoGuideDetailIds.includes(dataId)
        ? [...selectedPhotoGuideDetailIds, dataId]
        : selectedPhotoGuideDetailIds.filter((photoGuideDetailId) => photoGuideDetailId !== dataId)
    );
  };

  useEffect(() => {
    if ((postType === 2 && result === 3) || status === 12) {
      setDisabled(false);
    } else if ((!result || !description) && !myLegitOpinion) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [description, myLegitOpinion, postType, result, status]);

  if (editable && myLegitOpinion) {
    return (
      <Box customStyle={{ minHeight: 92 }}>
        <CtaButtonWrapper gap={8}>
          <Button
            fullWidth
            variant="contained"
            brandColor="primary"
            size="xlarge"
            onClick={handleClickEditComplete}
            disabled={!result || !description}
          >
            수정완료
          </Button>
        </CtaButtonWrapper>
      </Box>
    );
  }

  if (!isLegitHead && myLegitOpinion) {
    return (
      <Box customStyle={{ minHeight: 92 }}>
        <CtaButtonWrapper gap={8}>
          <Button
            fullWidth
            variant="contained"
            brandColor="primary"
            size="xlarge"
            onClick={() => setLegitAdminOpinionEditableState(true)}
          >
            수정하기
          </Button>
          <Button
            fullWidth
            variant="outlinedGhost"
            brandColor="gray"
            size="xlarge"
            onClick={() =>
              setDialogState({
                type: 'deleteLegitAdminOpinion',
                content: <Typography variant="h4">삭제되면 복구할 수 없습니다.</Typography>,
                secondButtonAction: handleClickDeleteConfirm,
                customStyleTitle: { minWidth: 269, paddingTop: 12 }
              })
            }
          >
            삭제하기
          </Button>
        </CtaButtonWrapper>
      </Box>
    );
  }

  return (
    <>
      <Box customStyle={{ minHeight: 92 }}>
        <CtaButtonWrapper gap={8}>
          <Button
            fullWidth
            variant="contained"
            brandColor="primary"
            size="xlarge"
            onClick={handleClick}
            disabled={disabled}
          >
            확인
          </Button>
        </CtaButtonWrapper>
      </Box>
      <BottomSheet open={open} onClose={() => setOpen(false)} disableSwipeable>
        <Box customStyle={{ padding: 20 }}>
          <Typography variant="h3" weight="bold">
            불가 이미지를 선택해 주세요!
          </Typography>
          <Grid container columnGap={12} rowGap={12} customStyle={{ marginTop: 20 }}>
            {(photoGuideDetails || []).map(({ imageUrl, commonPhotoGuideDetail }) => (
              <Grid
                key={`legit-request-photo-guide-detail-${commonPhotoGuideDetail.id}`}
                item
                xs={3}
              >
                <LegitPhotoGuideCard
                  photoGuideDetail={commonPhotoGuideDetail}
                  imageUrl={imageUrl}
                  hideLabel
                  hideHighLite={!selectedPhotoGuideDetailIds.includes(commonPhotoGuideDetail.id)}
                  onClick={handleClickPhotoGuideDetail}
                  data-id={commonPhotoGuideDetail.id}
                />
              </Grid>
            ))}
          </Grid>
          <Button
            variant="contained"
            brandColor="primary"
            size="xlarge"
            fullWidth
            onClick={handleClickPreConfirmEditConfirm}
            customStyle={{ marginTop: 52 }}
          >
            확인
          </Button>
        </Box>
      </BottomSheet>
    </>
  );
}

const CtaButtonWrapper = styled(Flexbox)`
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 20px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  z-index: ${({ theme: { zIndex } }) => zIndex.bottomNav};
`;

export default LegitAdminRequestCtaButton;
