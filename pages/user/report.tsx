import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import TextareaAutosize from 'react-textarea-autosize';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { useMutation } from '@tanstack/react-query';
import { Button, Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { ReportUserBottomSheet } from '@components/pages/report';

import type { PostReportData } from '@dto/user';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { postReport } from '@api/user';

import { userReportType, userReportTypeAtt } from '@constants/user';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';

import { rotate } from '@styles/transition';

import { toastState } from '@recoil/common';

function Report() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();

  const setToastState = useSetRecoilState(toastState);

  const { mutate: mutatePostReport, isLoading: isLoadingMutate } = useMutation(postReport, {
    onSuccess() {
      setToastState({ type: 'user', status: 'report' });
      router.back();
    }
  });

  const { userId, userName, isSeller } = useMemo(
    () => ({
      userId: Number(router.query.targetUserId || ''),
      userName: String(router.query.targetUserName || ''),
      isSeller: router.query.isTargetUserSeller || false
    }),
    [router.query.isTargetUserSeller, router.query.targetUserId, router.query.targetUserName]
  );

  const [params, setParams] = useState<PostReportData>({
    userId,
    type: 0,
    description: ''
  });
  const [open, setOpen] = useState(true);

  const handleClickReport = useCallback(async () => {
    if (!params.userId || !params.type || isLoadingMutate) return;

    logEvent(attrKeys.channel.SUBMIT_REPORT, {
      att: userReportTypeAtt[params.type as keyof typeof userReportTypeAtt]
    });

    await mutatePostReport(params);
  }, [isLoadingMutate, mutatePostReport, params]);

  useEffect(() => {
    if (!userId || !userName) router.push({ pathname: '/channels', query: { type: 0 } });

    logEvent(attrKeys.channel.VIEW_REPORT, { att: isSeller ? 'BUYER' : 'SELLER' });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <GeneralTemplate
        header={
          <Header
            onClickLeft={() => router.back()}
            showRight={false}
            customStyle={{ '& > div > div': { borderBottom: `1px solid ${common.line01}` } }}
          >
            <Typography variant="h3" weight="bold">
              신고하기
            </Typography>
          </Header>
        }
      >
        <Typography variant="h3" weight="bold" customStyle={{ padding: '32px 0' }}>
          {userName}님을
          <br />
          신고하는 이유를 알려주세요.
        </Typography>
        <Flexbox component="section" direction="vertical" gap={20} customStyle={{ flex: 1 }}>
          <Flexbox direction="vertical" gap={8}>
            <Typography variant="body1" weight="medium" color="ui60">
              신고사유
            </Typography>
            <SelectBox onClick={() => setOpen(true)}>
              <Label selected={!!params.type}>
                {params.type
                  ? userReportType[params.type as keyof typeof userReportType]
                  : '신고사유 선택'}
              </Label>
              <Icon name="DropdownFilled" viewBox="0 0 12 24" width={10} height={20} color="ui60" />
            </SelectBox>
          </Flexbox>
          <Flexbox direction="vertical" gap={8}>
            <Typography variant="body1" weight="medium" color="ui60">
              상세내용 입력(선택)
            </Typography>
            <Description>
              <TextareaAutosize
                placeholder="상세한 사유를 입력해주세요"
                maxLength={2000}
                value={params.description}
                onChange={(e) =>
                  setParams((prevState) => ({
                    ...prevState,
                    description: prevState.description?.length
                      ? e.target.value
                      : e.target.value.trim()
                  }))
                }
              />
            </Description>
          </Flexbox>
        </Flexbox>
        <Flexbox component="section" customStyle={{ marginBottom: 20 }}>
          <Button
            size="xlarge"
            variant="solid"
            brandColor="black"
            fullWidth
            disabled={!params.userId || !params.type || isLoadingMutate}
            onClick={handleClickReport}
          >
            {isLoadingMutate ? <AnimationLoading name="LoadingFilled" /> : '신고하기'}
          </Button>
        </Flexbox>
      </GeneralTemplate>
      <ReportUserBottomSheet open={open} setOpen={setOpen} setParams={setParams} />
    </>
  );
}

const SelectBox = styled.div`
  padding: 12px 34px 12px 12px;
  background-color: ${({ theme: { palette } }) => palette.common.uiWhite};
  border: 1px solid ${({ theme: { palette } }) => palette.common.line01};
  border-radius: 8px;
  position: relative;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  height: 44px;

  svg {
    display: inline-block;
    fill: currentcolor;
    flex-shrink: 0;
    position: absolute;
    right: 12px;
    pointer-events: none;
  }
`;

const Label = styled(Typography)<{ selected: boolean }>`
  padding: 0;
  display: block;
  transform-origin: left top;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 24px);
  color: ${({ theme: { palette }, selected }) =>
    selected ? palette.common.ui20 : palette.common.ui80};
`;

const Description = styled.div`
  position: relative;

  textarea {
    min-height: 124px;
    width: 100%;
    border: 1px solid ${({ theme: { palette } }) => palette.common.line01};
    border-radius: 8px;
    padding: 12px;
    color: ${({ theme: { palette } }) => palette.common.ui20};
    resize: none;

    ${({ theme: { typography } }) => ({
      fontSize: typography.h4.size,
      fontWeight: typography.h4.weight.regular,
      lineHeight: typography.h4.lineHeight,
      letterSpacing: typography.h4.letterSpacing
    })};

    ::placeholder {
      color: ${({
        theme: {
          palette: { common }
        }
      }) => common.ui80};
      white-space: pre-wrap;

      ${({ theme: { typography } }) => ({
        fontSize: typography.h4.size,
        fontWeight: typography.h4.weight.regular,
        lineHeight: typography.h4.lineHeight,
        letterSpacing: typography.h4.letterSpacing
      })};
    }
  }
`;

export const AnimationLoading = styled(Icon)`
  animation: ${rotate} 1s linear infinite;
  width: 30px;
`;

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  Initializer.initAccessTokenByCookies(getCookies({ req }));

  return {
    props: {}
  };
}

export default Report;
