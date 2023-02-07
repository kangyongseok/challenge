import type { HTMLAttributes, MouseEvent, RefObject } from 'react';
import { useRef, useState } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Button, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import { useMutation, useQuery } from '@tanstack/react-query';
import styled, { CSSObject } from '@emotion/styled';

import type { ProductLegitComment, ProductLegitCommentsParams } from '@dto/productLegit';

import { logEvent } from '@library/amplitude';

import {
  deleteProductLegitComment,
  fetchProductLegitComments,
  postProductLegitComment
} from '@api/productLegit';

import queryKeys from '@constants/queryKeys';
import {
  APP_DOWNLOAD_BANNER_HEIGHT,
  CAMEL_SUBSET_FONTFAMILY,
  HEADER_HEIGHT
} from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  legitResultCommentDataState,
  legitResultCommentEditableState
} from '@recoil/legitResultComment/atom';
import { dialogState, showAppDownloadBannerState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import LegitResultReply from './LegitResultReply';

interface LegitResultCommentProps extends HTMLAttributes<HTMLDivElement> {
  comment: ProductLegitComment;
  writerRef: RefObject<HTMLDivElement>;
}

function LegitResultComment({
  comment: { id: commentId, userId, result, description, dateCreated, replies = [] },
  writerRef,
  ...props
}: LegitResultCommentProps) {
  const router = useRouter();
  const { id } = router.query;
  const splitIds = String(id).split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);

  const { data: accessUser } = useQueryAccessUser();
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const setLegitResultCommentDataState = useSetRecoilState(legitResultCommentDataState);
  const setLegitResultCommentEditableState = useSetRecoilState(legitResultCommentEditableState);
  const setDialogState = useSetRecoilState(dialogState);

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const commentRef = useRef<HTMLDivElement>(null);

  const [params] = useState<ProductLegitCommentsParams>({
    productId,
    page: 0,
    size: 100
  });

  const { data: { content: comments = [] } = {}, refetch } = useQuery(
    queryKeys.productLegits.comments(params),
    () => fetchProductLegitComments(params),
    {
      keepPreviousData: true,
      enabled: !!id
    }
  );

  const { mutate, isLoading } = useMutation(postProductLegitComment);
  const { mutate: deleteMutate, isLoading: isLoadingDeleteMutate } =
    useMutation(deleteProductLegitComment);

  const handleClick = () => {
    if (!accessUser) {
      router.push({
        pathname: '/login',
        query: {
          returnUrl: `/legit/${id}/result`
        }
      });
      return;
    }

    setOpen(!open);
  };

  const handleClickEdit = (e: MouseEvent<HTMLDivElement>) => {
    const dataId = Number(e.currentTarget.getAttribute('data-id') || 0);

    const findComment = comments.find((comment) => comment.id === dataId);

    if (!findComment) return;

    if (writerRef.current) {
      window.scrollTo({
        top:
          writerRef.current.offsetTop -
          (showAppDownloadBanner ? HEADER_HEIGHT + APP_DOWNLOAD_BANNER_HEIGHT : HEADER_HEIGHT),
        behavior: 'smooth'
      });
    }
    setLegitResultCommentEditableState(true);
    setLegitResultCommentDataState({
      commentId: findComment.id,
      result: findComment.result,
      description: findComment.description
    });
  };

  const handleClickDeleteConfirm = () => {
    logEvent(attrKeys.legitResult.CLICK_DELETE_POPUP, {
      name: attrProperty.legitName.LEGIT_COMMENT,
      att: '확인'
    });

    deleteMutate(
      {
        productId,
        commentId
      },
      {
        onSuccess: () => refetch()
      }
    );
  };

  const handleClickCancelConfirm = () => {
    logEvent(attrKeys.legitResult.CLICK_DELETE_POPUP, {
      name: attrProperty.legitName.LEGIT_COMMENT,
      att: '취소'
    });
  };

  const handleClickDelete = () => {
    logEvent(attrKeys.legitResult.CLICK_COMMENT_DELETE, {
      name: attrProperty.legitName.LEGIT_COMMENT,
      type: 'comment'
    });

    if (isLoadingDeleteMutate) return;

    setDialogState({
      type: 'deleteLegitResultComment',
      content: <Typography variant="h4">삭제되면 복구할 수 없습니다.</Typography>,
      firstButtonAction: handleClickCancelConfirm,
      secondButtonAction: handleClickDeleteConfirm,
      customStyleTitle: { minWidth: 269, paddingTop: 12 }
    });
  };

  const handleClickPost = () => {
    logEvent(attrKeys.legitResult.SUBMIT_COMMENT, {
      name: attrProperty.legitName.LEGIT_INFO,
      title: attrProperty.legitTitle.LEGIT_COMMENT,
      att: value,
      type: 'recomment'
    });

    mutate(
      {
        productId,
        result: 0,
        description: value,
        parentId: commentId
      },
      {
        onSuccess: () => {
          refetch();
          setOpen(false);
          setValue('');
        }
      }
    );
  };

  return (
    <Flexbox ref={commentRef} gap={8} {...props}>
      <LegitAvatar result={result}>
        {result === 1 && <Icon name="OpinionAuthenticOutlined" width={18} height={18} />}
        {result === 2 && <Icon name="OpinionFakeOutlined" width={18} height={18} />}
        {result === 3 && <Icon name="OpinionImpossibleOutlined" width={18} height={18} />}
      </LegitAvatar>
      <Flexbox direction="vertical" justifyContent="center" customStyle={{ flexGrow: 1 }}>
        <Flexbox alignment="center" justifyContent="space-between" customStyle={{ height: 24 }}>
          <Flexbox alignment="center" gap={4}>
            <Typography weight="medium">UserID {userId}</Typography>
            <Typography variant="small2" customStyle={{ color: common.ui80 }}>
              {dayjs(dateCreated).add(-1, 'seconds').fromNow()}
            </Typography>
          </Flexbox>
          <Flexbox alignment="center" gap={12}>
            {(accessUser || {}).userId === userId && (
              <>
                <Typography
                  variant="small2"
                  data-id={commentId}
                  onClick={handleClickEdit}
                  customStyle={{ color: common.ui80, cursor: 'pointer' }}
                >
                  수정
                </Typography>
                <Typography
                  variant="small2"
                  onClick={handleClickDelete}
                  customStyle={{ color: common.ui80, cursor: 'pointer' }}
                >
                  삭제
                </Typography>
              </>
            )}
            <Typography
              variant="small2"
              onClick={handleClick}
              customStyle={{ color: common.ui80, cursor: 'pointer' }}
            >
              답글
            </Typography>
          </Flexbox>
        </Flexbox>
        <Typography
          dangerouslySetInnerHTML={{
            __html: `${description.replace(/\r?\n/g, '<br />')}`
          }}
          customStyle={{ marginTop: 10, color: common.ui60 }}
        />
        {open && (
          // TODO 추후 컴포넌트화
          <ReplyWriter>
            <Typography weight="bold" customStyle={{ color: common.ui80 }}>
              User ID {(accessUser || {}).userId}
            </Typography>
            <TextArea
              onChange={(e) => setValue(e.currentTarget.value)}
              value={value}
              maxLength={300}
              placeholder="답글을 남겨보세요."
            />
            <Flexbox alignment="center" justifyContent="space-between">
              <Typography variant="small2" weight="medium" customStyle={{ color: common.ui80 }}>
                {value.length} / 300자
              </Typography>
              <Button
                variant="solid"
                brandColor="primary"
                size="small"
                onClick={handleClickPost}
                disabled={!accessUser || !value || isLoading}
                customStyle={{ whiteSpace: 'nowrap' }}
              >
                등록
              </Button>
            </Flexbox>
          </ReplyWriter>
        )}
        {replies.length > 0 && (
          <Flexbox direction="vertical" gap={20} customStyle={{ marginTop: 22 }}>
            {replies.map((reply) => (
              <LegitResultReply key={`legit-reply-${reply.id}`} reply={reply} />
            ))}
          </Flexbox>
        )}
      </Flexbox>
    </Flexbox>
  );
}

export const LegitAvatar = styled.div<{ result: 1 | 2 | 3 }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  min-width: 24px;
  height: 24px;
  min-height: 24px;
  border-radius: 50%;

  ${({
    theme: {
      palette: { secondary }
    },
    result
  }) => {
    switch (result) {
      case 3:
        return {
          backgroundColor: secondary.purple.highlight,
          '& *': {
            color: `${secondary.purple.light} !important`
          }
        };
      case 2:
        return {
          backgroundColor: secondary.red.highlight,
          '& *': {
            color: `${secondary.red.light} !important`
          }
        };
      default:
        return {
          backgroundColor: secondary.blue.highlight,
          '& *': {
            color: `${secondary.blue.light} !important`
          }
        };
    }
  }}
`;

export const ReplyWriter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  margin-top: 20px;
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
    }
  }): CSSObject => ({
    height: 168,
    padding: 12,
    flexDirection: 'column',
    alignItems: 'inherit',
    border: `1px solid ${common.ui20}`,
    backgroundColor: common.bg01
  })};
`;

export const TextArea = styled.textarea`
  width: 100%;
  height: 100%;
  margin-top: 8px;
  background-color: transparent;
  outline: 0;
  resize: none;
  font-family: ${CAMEL_SUBSET_FONTFAMILY};
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
`;

export default LegitResultComment;
