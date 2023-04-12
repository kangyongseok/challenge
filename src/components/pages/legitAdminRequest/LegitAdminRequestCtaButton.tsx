import { useEffect, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { BottomSheet, Box, Button, Flexbox, Grid, Typography, useTheme } from 'mrcamel-ui';
import { useMutation, useQuery } from '@tanstack/react-query';
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

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { result, description } = useRecoilValue(legitAdminOpinionDataState);
  const editable = useRecoilValue(legitAdminOpinionEditableState);
  const setLegitAdminOpinionEditableState = useSetRecoilState(legitAdminOpinionEditableState);
  const setToastState = useSetRecoilState(toastState);
  const setDialogState = useSetRecoilState(dialogState);
  const resetLegitAdminOpinionDataState = useResetRecoilState(legitAdminOpinionDataState);

  const { data: accessUser } = useQueryAccessUser();

  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [focused, setFocused] = useState(false);
  const [preConfirmDescription, setPreConfirmDescription] = useState('');
  const [selectedPhotoGuideDetailIds, setSelectedPhotoGuideDetailIds] = useState<number[]>([]);

  const {
    data: {
      status,
      productResult: { photoGuideDetails = [], postType = 0 } = {},
      legitOpinions = [],
      isLegitHead
    } = {},
    refetch
  } = useQuery(queryKeys.productLegits.legit(Number(id)), () => fetchProductLegit(Number(id)), {
    enabled: !!id
  });

  const { mutate, isLoading } = useMutation(postProductLegitOpinion);
  const { mutate: editMutate, isLoading: isLoadingEditMutate } =
    useMutation(putProductLegitOpinion);
  const { mutate: deleteMutate, isLoading: isLoadingDeleteMutate } =
    useMutation(deleteProductLegitOpinion);
  const { mutate: preConfirmMutate, isLoading: isLoadingPreConfirmMutate } = useMutation(
    postProductLegitPreConfirmEdit
  );

  const myLegitOpinion = useMemo(
    () => legitOpinions.find(({ roleLegit: { userId } }) => userId === (accessUser || {}).userId),
    [legitOpinions, accessUser]
  );

  const isRequestLegit = postType === 2;

  const handleClick = () => {
    if (myLegitOpinion) {
      router.push({
        pathname: '/legit/admin',
        query: {
          tab: 'request'
        }
      });
    } else if (isLegitHead && isRequestLegit && result === 3) {
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
                if (isLegitHead && result === 3) {
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
        photoGuideIds: selectedPhotoGuideDetailIds,
        description: preConfirmDescription || undefined
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
    if ((status === 10 || status === 12) && result) {
      setDisabled(false);
    } else if ((isLegitHead && isRequestLegit && result === 3) || status === 12) {
      setDisabled(false);
    } else if ((!result || !description) && !myLegitOpinion) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [isLegitHead, description, myLegitOpinion, isRequestLegit, result, status]);

  if (editable && myLegitOpinion) {
    return (
      <Box customStyle={{ minHeight: 92 }}>
        <CtaButtonWrapper gap={8}>
          <Button
            fullWidth
            variant="solid"
            brandColor="primary"
            size="xlarge"
            onClick={handleClickEditComplete}
            disabled={!result || !description || isLoadingEditMutate}
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
            variant="solid"
            brandColor="primary"
            size="xlarge"
            onClick={() => setLegitAdminOpinionEditableState(true)}
          >
            수정하기
          </Button>
          <Button
            fullWidth
            variant="outline-ghost"
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
            disabled={isLoadingDeleteMutate}
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
            variant="solid"
            brandColor="primary"
            size="xlarge"
            onClick={handleClick}
            disabled={disabled || isLoading}
          >
            확인
          </Button>
        </CtaButtonWrapper>
      </Box>
      <BottomSheet open={open} onClose={() => setOpen(false)} disableSwipeable>
        <Box customStyle={{ padding: 20 }}>
          <Typography variant="h3" weight="bold">
            보완할 이미지 선택 혹은 보완의견을 남겨주세요
          </Typography>
          <Grid container columnGap={12} rowGap={12} customStyle={{ marginTop: 20 }}>
            {(photoGuideDetails || []).map(
              ({ imageUrl, commonPhotoGuideDetail, staticImageUrl }) => (
                <Grid
                  key={`legit-request-photo-guide-detail-${commonPhotoGuideDetail.id}`}
                  item
                  xs={3}
                >
                  <LegitPhotoGuideCard
                    photoGuideDetail={commonPhotoGuideDetail}
                    imageUrl={imageUrl}
                    staticImageUrl={staticImageUrl}
                    hideLabel
                    hideHighLite={!selectedPhotoGuideDetailIds.includes(commonPhotoGuideDetail.id)}
                    onClick={handleClickPhotoGuideDetail}
                    data-id={commonPhotoGuideDetail.id}
                  />
                </Grid>
              )
            )}
          </Grid>
          <OpinionWriter focused={focused}>
            <TextArea
              onChange={(e) => setPreConfirmDescription(e.currentTarget.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              value={preConfirmDescription}
              maxLength={300}
              placeholder="내용을 입력해주세요."
            />
            <Typography variant="small2" weight="medium" customStyle={{ color: common.ui80 }}>
              {preConfirmDescription.length} / 300자
            </Typography>
          </OpinionWriter>
          <Button
            variant="solid"
            brandColor="primary"
            size="xlarge"
            fullWidth
            onClick={handleClickPreConfirmEditConfirm}
            disabled={!selectedPhotoGuideDetailIds.length || isLoadingPreConfirmMutate}
            customStyle={{ marginTop: 52 }}
          >
            보완 요청
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

const OpinionWriter = styled.div<{ focused: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  height: 270px;
  margin-top: 20px;
  padding: 12px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg01};
  border-radius: ${({ theme: { box } }) => box.round['8']};
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
  overflow: hidden;

  ${({
    theme: {
      palette: { common }
    },
    focused
  }) =>
    focused
      ? {
          borderColor: common.uiBlack
        }
      : {}};
`;

const TextArea = styled.textarea`
  flex-grow: 1;
  outline: 0;
  width: 100%;
  height: 100%;
  ${({
    theme: {
      palette: { common },
      typography: { h4 }
    }
  }) => ({
    fontSize: h4.size,
    fontWeight: h4.weight.regular,
    letterSpacing: h4.letterSpacing,
    color: common.ui20
  })};
  &::placeholder {
    ${({
      theme: {
        palette: { common },
        typography: { h4 }
      }
    }) => ({
      fontSize: h4.size,
      fontWeight: h4.weight.regular,
      letterSpacing: h4.letterSpacing,
      color: common.ui90
    })};
  }
  &:disabled {
    background-color: transparent;
  }
`;

export default LegitAdminRequestCtaButton;
