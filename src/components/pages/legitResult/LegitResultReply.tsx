import type { HTMLAttributes, MouseEvent } from 'react';
import { useEffect, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import type { ProductLegitReply } from '@dto/productLegit';
import { ProductLegitCommentsParams } from '@dto/productLegit';

import { logEvent } from '@library/amplitude';

import {
  deleteProductLegitComment,
  fetchProductLegitComments,
  putProductLegitComment
} from '@api/productLegit';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { dialogState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface LegitResultReplyProps extends HTMLAttributes<HTMLDivElement> {
  reply: ProductLegitReply;
}

function LegitResultReply({
  reply: { id: replyId, userId, description, dateCreated },
  ...props
}: LegitResultReplyProps) {
  const router = useRouter();
  const { id } = router.query;
  const splitIds = String(id).split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();

  const [params] = useState<ProductLegitCommentsParams>({
    productId,
    page: 0,
    size: 100
  });

  const { refetch } = useQuery(
    queryKeys.productLegits.comments(params),
    () => fetchProductLegitComments(params),
    {
      keepPreviousData: true,
      enabled: !!id
    }
  );

  const [editable, setEditable] = useState(false);
  const [value, setValue] = useState('');

  const setDialogState = useSetRecoilState(dialogState);

  const { mutate } = useMutation(putProductLegitComment);
  const { mutate: deleteMutate } = useMutation(deleteProductLegitComment);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    logEvent(attrKeys.legitResult.SUBMIT_COMMENT, {
      name: attrProperty.legitName.LEGIT_COMMENT,
      title: attrProperty.legitTitle.EDIT,
      type: 'recomment'
    });

    mutate(
      {
        productId,
        commentId: replyId,
        result: 0,
        description: value
      },
      {
        onSuccess: () => {
          refetch();
          setEditable(false);
        }
      }
    );
  };

  const handleClickDeleteConfirm = () => {
    deleteMutate(
      {
        productId,
        commentId: replyId
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
      type: 'recomment'
    });

    setDialogState({
      type: 'deleteLegitResultReply',
      content: <Typography variant="h4">삭제되면 복구할 수 없습니다.</Typography>,
      firstButtonAction: handleClickCancelConfirm,
      secondButtonAction: handleClickDeleteConfirm,
      customStyleTitle: { minWidth: 269, paddingTop: 12 }
    });
  };

  useEffect(() => {
    if (editable) {
      setValue(description);
    } else {
      setValue('');
    }
  }, [editable, description]);

  if (editable) {
    return (
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
            onClick={handleClick}
            disabled={!accessUser || !value}
            customStyle={{ whiteSpace: 'nowrap' }}
          >
            수정
          </Button>
        </Flexbox>
      </ReplyWriter>
    );
  }

  return (
    <div {...props}>
      <Flexbox direction="vertical" justifyContent="center" customStyle={{ flexGrow: 1 }}>
        <Flexbox alignment="center" justifyContent="space-between" customStyle={{ height: 24 }}>
          <Flexbox alignment="center" gap={4}>
            <Marker />
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
                  onClick={() => setEditable(true)}
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
          </Flexbox>
        </Flexbox>
        <Typography
          dangerouslySetInnerHTML={{
            __html: `${(description || '').replace(/\r?\n/g, '<br />')}`
          }}
          customStyle={{ margin: '10px 0 0 16px', color: common.ui60 }}
        />
      </Flexbox>
    </div>
  );
}

export const Marker = styled.div`
  width: 8px;
  height: 8px;
  margin-right: 4px;
  border-left: 2px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
  border-bottom: 2px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
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

export default LegitResultReply;
