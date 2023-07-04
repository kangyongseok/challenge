import { useEffect, useState } from 'react';
import type { MouseEvent, RefObject } from 'react';

import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Box, Button, Flexbox, Tooltip, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import LegitOpinionButton from '@components/UI/molecules/LegitOpinionButton';

import type { ProductLegitCommentsParams } from '@dto/productLegit';

import { logEvent } from '@library/amplitude';

import {
  fetchProductLegit,
  fetchProductLegitComments,
  postProductLegitComment,
  putProductLegitComment
} from '@api/productLegit';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  legitResultCommentDataState,
  legitResultCommentEditableState,
  legitResultCommentFocusedState,
  legitResultCommentOpenContactBannerState
} from '@recoil/legitResultComment/atom';
import useSession from '@hooks/useSession';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

interface LegitResultCommentWriterProps {
  writerRef: RefObject<HTMLDivElement>;
}

function LegitResultCommentWriter({ writerRef }: LegitResultCommentWriterProps) {
  const router = useRouter();
  const { id } = router.query;
  const splitIds = String(id).split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [{ result, description, commentId }, setLegitResultCommentDataState] = useRecoilState(
    legitResultCommentDataState
  );
  const [editable, setLegitResultCommentEditableState] = useRecoilState(
    legitResultCommentEditableState
  );
  const setLegitResultCommentOpenContactBannerState = useSetRecoilState(
    legitResultCommentOpenContactBannerState
  );
  const setLegitResultCommentFocusedState = useSetRecoilState(legitResultCommentFocusedState);
  const resetLegitResultCommentDataState = useResetRecoilState(legitResultCommentDataState);

  const [open, setOpen] = useState(false);
  const [openTooltip, setOpenTooltip] = useState(false);
  const [params] = useState<ProductLegitCommentsParams>({
    productId,
    page: 0,
    size: 100
  });

  const { isLoggedIn, data: accessUser } = useSession();
  const { data: { roles = [] } = {} } = useQueryUserInfo();

  const { mutate, isLoading } = useMutation(postProductLegitComment);
  const { mutate: editMutate, isLoading: isLoadingEditMutate } =
    useMutation(putProductLegitComment);

  const { data: { status } = {} } = useQuery(
    queryKeys.productLegits.legit(productId),
    () => fetchProductLegit(productId),
    {
      enabled: !!id
    }
  );

  const { refetch } = useQuery(
    queryKeys.productLegits.comments(params),
    () => fetchProductLegitComments(params),
    {
      keepPreviousData: true,
      enabled: !!id
    }
  );

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const dataResult = Number(e.currentTarget.getAttribute('data-result')) as 0 | 1 | 2 | 3;

    setOpenTooltip(false);

    if (result === dataResult) {
      setLegitResultCommentDataState((prevState) => ({
        ...prevState,
        result: 0
      }));
      return;
    }

    setLegitResultCommentDataState((prevState) => ({
      ...prevState,
      result: dataResult
    }));
  };

  const handleClickCommentWriter = () => {
    if (!isLoggedIn) {
      router.push({
        pathname: '/login',
        query: {
          returnUrl: `/legit/${id}/result`
        }
      });
      return;
    }
    if (!result) {
      setOpenTooltip(true);
      return;
    }

    if (open) {
      setLegitResultCommentEditableState(false);
      resetLegitResultCommentDataState();
    }

    setOpen(!open);
  };

  const handleClickPost = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const attResult = () => {
      switch (result) {
        case 1:
          return '정품의견';
        case 2:
          return '가품의견';
        default:
          return '감정불가';
      }
    };
    logEvent(attrKeys.legitResult.SUBMIT_COMMENT, {
      name: attrProperty.legitName.LEGIT_INFO,
      title: attrProperty.legitTitle.LEGIT_COMMENT,
      att: attResult(),
      type: 'comment'
    });

    mutate(
      {
        productId,
        result,
        description
      },
      {
        onSuccess: () => {
          refetch();
          setLegitResultCommentOpenContactBannerState(true);
          resetLegitResultCommentDataState();
          setOpen(false);
        }
      }
    );
  };

  const handleClickEdit = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    logEvent(attrKeys.legitResult.SUBMIT_COMMENT, {
      namr: attrProperty.legitName.LEGIT_COMMENT,
      title: attrProperty.legitTitle.EDIT,
      type: 'comment'
    });

    editMutate(
      {
        productId,
        commentId,
        result,
        description
      },
      {
        onSuccess: () => {
          refetch();
          setLegitResultCommentEditableState(false);
          resetLegitResultCommentDataState();
        }
      }
    );
  };

  useEffect(() => {
    setOpen(editable);
  }, [editable]);

  useEffect(() => {
    return () => {
      resetLegitResultCommentDataState();
    };
  }, [resetLegitResultCommentDataState]);

  if ((roles as string[]).some((role) => role.indexOf('PRODUCT_LEGIT') >= 0)) return null;

  return (
    <Box ref={writerRef} component="section">
      <Flexbox gap={12} justifyContent="center">
        <TooltipWrapper>
          <Tooltip
            open={openTooltip}
            message="의견을 먼저 선택해 주세요!"
            placement="bottom"
            customStyle={{ top: 24, height: 'fit-content', zIndex: 0 }}
          >
            <Flexbox gap={12} justifyContent="center">
              <LegitOpinionButton
                data-result={1}
                onClick={handleClick}
                status={status}
                isActive={result === 1}
              />
              <LegitOpinionButton
                variant="fake"
                data-result={2}
                onClick={handleClick}
                status={status}
                isActive={result === 2}
              />
              <LegitOpinionButton
                variant="impossible"
                data-result={3}
                onClick={handleClick}
                status={status}
                isActive={result === 3}
              />
            </Flexbox>
          </Tooltip>
        </TooltipWrapper>
      </Flexbox>
      <CommentWriter open={open} onClick={handleClickCommentWriter}>
        {open && (
          <Typography weight="bold" customStyle={{ color: common.ui80 }}>
            User ID {(accessUser || {}).userId}
          </Typography>
        )}
        <TextArea
          open={open}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) =>
            setLegitResultCommentDataState((prevState) => ({
              ...prevState,
              description: e.currentTarget.value
            }))
          }
          onFocus={() => setLegitResultCommentFocusedState(true)}
          onBlur={() => setLegitResultCommentFocusedState(false)}
          value={description}
          placeholder={!open ? '첫 댓글을 입력해 주세요.' : '댓글을 남겨보세요.'}
          disabled={!open || !result}
          maxLength={300}
        />
        <Flexbox alignment="center" justifyContent="space-between">
          {open && (
            <Typography variant="small2" weight="medium" customStyle={{ color: common.ui80 }}>
              {description.length} / 300자
            </Typography>
          )}
          <Button
            variant="solid"
            brandColor="primary"
            size="small"
            onClick={editable ? handleClickEdit : handleClickPost}
            disabled={!description || !result || isLoading || isLoadingEditMutate}
            customStyle={{ whiteSpace: 'nowrap' }}
          >
            {editable ? '수정' : '등록'}
          </Button>
        </Flexbox>
      </CommentWriter>
    </Box>
  );
}

const TooltipWrapper = styled.div`
  & > div {
    width: 100%;
  }
`;

const CommentWriter = styled.div<{ open: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  margin-top: 32px;
  padding: 12px 6px 12px 12px;
  border: 1px solid
    ${({
      theme: {
        mode,
        palette: { common }
      }
    }) => (mode === 'dark' ? common.line01 : 'transparent')};
  border-radius: ${({ theme: { box } }) => box.round['8']};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg03};

  ${({
    theme: {
      palette: { common }
    },
    open
  }): CSSObject =>
    open
      ? {
          height: 168,
          padding: 12,
          flexDirection: 'column',
          alignItems: 'inherit',
          border: `1px solid ${common.ui20}`,
          backgroundColor: common.bg01
        }
      : {}};
`;

const TextArea = styled.textarea<{ open: boolean }>`
  width: 100%;
  height: 100%;
  background-color: transparent;
  outline: 0;
  resize: none;
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
      color: common.ui80
    })};
  }

  ${({ open }) =>
    open
      ? {
          marginTop: 8
        }
      : {
          overflow: 'hidden'
        }};
`;

export default LegitResultCommentWriter;
