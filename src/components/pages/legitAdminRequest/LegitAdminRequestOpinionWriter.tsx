import { useEffect, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import TextareaAutosize from 'react-textarea-autosize';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Box, Flexbox, Tooltip, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import LegitOpinionButton from '@components/UI/molecules/LegitOpinionButton';

import { fetchProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';

import {
  legitAdminOpinionDataState,
  legitAdminOpinionEditableState
} from '@recoil/legitAdminOpinion/atom';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function LegitAdminRequestOpinionWriter() {
  const router = useRouter();
  const { id } = router.query;

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [{ result, description }, setLegitAdminOpinionDataState] = useRecoilState(
    legitAdminOpinionDataState
  );
  const editable = useRecoilValue(legitAdminOpinionEditableState);
  const resetLegitAdminOpinionDataState = useResetRecoilState(legitAdminOpinionDataState);

  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const { data: accessUser } = useQueryAccessUser();

  const {
    data: { status, legitOpinions, productResult: { postType = 0 } = {}, isLegitHead } = {}
  } = useQuery(queryKeys.productLegits.legit(Number(id)), () => fetchProductLegit(Number(id)), {
    enabled: !!id
  });

  const myLegitOpinion = useMemo(
    () =>
      (legitOpinions || []).find(
        ({ roleLegit: { userId } }) => userId === (accessUser || {}).userId
      ),
    [legitOpinions, accessUser]
  );

  const isRequestLegit = postType === 2;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const dataResult = Number(e.currentTarget.getAttribute('data-result')) as 0 | 1 | 2 | 3;

    setOpen(false);

    if (result === dataResult) {
      setLegitAdminOpinionDataState((prevState) => ({
        ...prevState,
        result: 0
      }));
      return;
    }

    setLegitAdminOpinionDataState((prevState) => ({
      ...prevState,
      result: dataResult
    }));
  };

  const handleFocus = () => {
    if (!result) {
      setOpen(true);
      return;
    }

    setFocused(true);
  };

  useEffect(() => {
    if (editable && myLegitOpinion) {
      setLegitAdminOpinionDataState({
        result: myLegitOpinion.result,
        description: myLegitOpinion.description
      });
    }
  }, [editable, myLegitOpinion, setLegitAdminOpinionDataState]);

  useEffect(() => {
    return () => {
      resetLegitAdminOpinionDataState();
    };
  }, [resetLegitAdminOpinionDataState]);

  if (!editable && myLegitOpinion) return null;

  return (
    <Box
      component="section"
      customStyle={{
        position: 'relative',
        textAlign: 'center',
        margin: '52px 0'
      }}
    >
      <TitleBox>
        <Title weight="medium">감정의견을 남겨주세요.</Title>
      </TitleBox>
      <TooltipWrapper>
        <Tooltip
          open={open}
          message="의견을 먼저 선택해 주세요!"
          placement="bottom"
          customStyle={{
            top: 24,
            height: 'fit-content',
            zIndex: 0
          }}
        >
          <Flexbox gap={12} justifyContent="center" customStyle={{ marginTop: 23 }}>
            <LegitOpinionButton
              data-result={1}
              onClick={handleClick}
              isActive={result === 1}
              disabled={isRequestLegit && status === 12}
            />
            <LegitOpinionButton
              variant="fake"
              data-result={2}
              onClick={handleClick}
              isActive={result === 2}
              disabled={isRequestLegit && status === 12}
            />
            <LegitOpinionButton
              variant="impossible"
              data-result={3}
              onClick={handleClick}
              isActive={result === 3 || status === 12}
              disabled={isRequestLegit && status === 12}
            />
          </Flexbox>
        </Tooltip>
      </TooltipWrapper>
      <OpinionWriter
        hide={(isLegitHead && isRequestLegit && result === 3) || (isRequestLegit && status === 12)}
        focused={focused}
        onClick={handleFocus}
      >
        <TextArea
          onFocus={handleFocus}
          onBlur={() => setFocused(false)}
          onChange={(e) =>
            setLegitAdminOpinionDataState((prevState) => ({
              ...prevState,
              description: e.currentTarget.value
            }))
          }
          value={description}
          maxLength={300}
          disabled={!result}
          hasResult={!!result}
          placeholder="내용을 입력해주세요."
        />
        <Typography variant="small2" weight="medium" customStyle={{ color: common.ui80 }}>
          {description.length} / 300자
        </Typography>
      </OpinionWriter>
    </Box>
  );
}

const TooltipWrapper = styled.div`
  & > div {
    width: 100%;
  }
`;

const TitleBox = styled.div`
  position: relative;
  height: 20px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg01};
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui60};

  &:after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    width: 100%;
    border-bottom: 1px dashed
      ${({
        theme: {
          palette: { common }
        }
      }) => common.line01};
    z-index: 0;
  }
`;

const Title = styled(Typography)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 0 16px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg01};
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui60};
  z-index: 1;
`;

const OpinionWriter = styled.div<{ hide: boolean; focused: boolean }>`
  display: flex;
  ${({ hide }): CSSObject =>
    hide
      ? {
          display: 'none'
        }
      : {}};
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  height: 270px;
  margin-top: 32px;
  padding: 12px;
  user-select: auto;
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

const TextArea = styled(TextareaAutosize)<{ hasResult: boolean }>`
  flex-grow: 1;
  outline: 0;
  width: 100%;
  height: 100%;
  pointer-events: ${({ hasResult }) => (hasResult ? 'auto' : 'none')};
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

export default LegitAdminRequestOpinionWriter;
