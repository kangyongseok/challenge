/* eslint-disable no-nested-ternary */
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Flexbox, Typography, dark, useTheme } from 'mrcamel-ui';
import { isEmpty } from 'lodash-es';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';
import type { CSSObject } from '@emotion/styled';
import { Keyframes, keyframes } from '@emotion/react';

import { logEvent } from '@library/amplitude';

import { fetchProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';
import authInfoIcon from '@constants/authInfoIcon';
import attrKeys from '@constants/attrKeys';

import { animationKeyframesState, firstUserAnimationState } from '@recoil/legitStatus';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

interface ProcessInfo {
  label: string;
  imgName: (option: string) => ReactNode;
  status: number;
  hasFail?: boolean;
}

interface ColorObject {
  color: string;
  background: string;
  active?: boolean;
  next?: boolean;
}

const processInfo: ProcessInfo[] = [
  { label: '신청완료', imgName: authInfoIcon.RequestIcon, status: 1 },
  { label: '사진검토', imgName: authInfoIcon.SearchIcon, status: 10, hasFail: true },
  { label: '사진감정', imgName: authInfoIcon.IngIcon, status: 20 },
  { label: '감정완료', imgName: authInfoIcon.SuccessIcon, status: 30 }
];

// TODO 추후 로직 수정..
function LegitStatusVisualProcess() {
  const router = useRouter();
  const setTimeoutRef = useRef<NodeJS.Timeout>();
  const splitIds = String(router.query.id || '').split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);
  const {
    theme: {
      palette: { common, primary, secondary }
    }
  } = useTheme();
  const { refetch } = useQueryUserInfo();
  const { data } = useQuery(
    queryKeys.productLegits.legit(productId),
    () => fetchProductLegit(productId),
    {
      enabled: !!router.query.id,
      onSuccess: () => refetch(),
      refetchOnMount: (result) => {
        return isEmpty(result) ? 'always' : true;
      }
    }
  );
  const [isAnimation, atomIsAnimation] = useRecoilState(firstUserAnimationState);
  const boxFade = useRecoilValue(animationKeyframesState);

  const isFirstLegit = router.query.firstLegit === 'true';

  const animationCount = useCallback(() => {
    if (isFirstLegit) {
      setTimeoutRef.current = setTimeout(() => {
        atomIsAnimation(true);
      }, 5000);
    }
  }, [atomIsAnimation, isFirstLegit]);

  const getLegitStatusName = () => {
    switch (data?.status) {
      case 1:
        return 'REQUESTED';
      case 10:
        return 'PRE_CONFIRM';
      case 11:
        return 'PRE_CONFIRM_FAIL';
      case 12:
        return 'PRE_CONFIRM_EDIT';
      case 13:
        return 'PRE_CONFIRM_EDIT_DONE';
      case 20:
        return 'AUTHENTICATION';
      case 30:
        return 'AUTHORIZED';
      default:
        return '';
    }
  };

  useEffect(() => {
    if (data) {
      logEvent(attrKeys.legit.VIEW_LEGIT_INFO, {
        att: getLegitStatusName()
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (data?.status === 20 || data?.status === 30) {
      router.replace(`/legit/${router.query.id}/result`);
    }
  }, [data, router]);

  useEffect(() => {
    if (router.query) {
      animationCount();
    }
    return () => {
      clearTimeout(setTimeoutRef.current);
      atomIsAnimation(false);
    };
  }, [router.query, animationCount, atomIsAnimation]);

  const returnColor = useCallback(
    ({ index, authStatus }: { index: number; authStatus: number }) => {
      const colorObject: ColorObject = {
        color: primary.main,
        background: 'none',
        active: true,
        next: true
      };
      const fail = data?.status === 11 || data?.status === 12;
      if (isFirstLegit) {
        // 최초 접근시
        if (isAnimation && index === 1) {
          return colorObject;
        }
        if (index === 0) {
          if (isAnimation) {
            return {
              ...colorObject,
              background: dark.palette.primary.highlight,
              color: dark.palette.primary.light,
              next: false
            };
          }
          return colorObject;
        }
      } else {
        if (fail && index === 1) {
          return { ...colorObject, color: secondary.red.main, next: false };
        }
        if (!fail && data && authStatus === 10 && data.status === 13) {
          return colorObject;
        }
        if (!fail && data && authStatus < data.status) {
          return {
            ...colorObject,
            background: dark.palette.primary.highlight,
            color: dark.palette.primary.light,
            next: false
          };
        }
        if (data && authStatus === data.status) {
          return colorObject;
        }
      }
      return { color: common.ui80, background: common.bg02 };
    },
    [primary.main, data, isFirstLegit, common.ui80, common.bg02, isAnimation, secondary.red.main]
  );

  const returnIcon = (info: ProcessInfo, i: number) => {
    if (data) {
      if (isFirstLegit) {
        if (isAnimation && i === 0) {
          return <authInfoIcon.ApproveIcon />;
        }
      } else {
        const fail = data.status === 11 || data.status === 12;
        if (fail) {
          if (i === 1) {
            return info.imgName(returnColor({ index: i, authStatus: info.status }).color);
          }
          if (i > 1) {
            return <authInfoIcon.ErrorIcon />;
          }
        }
        if (info.status === 10 && data.status === 13) {
          return info.imgName(returnColor({ index: i, authStatus: info.status }).color);
        }
        if (info.status < data.status) {
          return <authInfoIcon.ApproveIcon />;
        }
        return info.imgName(returnColor({ index: i, authStatus: info.status }).color);
      }
      return info.imgName(returnColor({ index: i, authStatus: info.status }).color);
    }
    return '';
  };

  return (
    <Flexbox
      alignment="center"
      justifyContent="center"
      customStyle={{
        margin: `104px 0 ${data?.status === 11 || data?.status === 12 ? 52 : 100}px`,
        minHeight: 93
      }}
    >
      {data &&
        processInfo.map((info, i) => (
          <Flexbox
            key={`process-auth-info-${info.label}`}
            alignment="center"
            justifyContent="center"
          >
            <ProcessCard isAnimation={isAnimation} index={i} boxFade={boxFade}>
              <BorderBox colorInfo={returnColor({ index: i, authStatus: info.status })}>
                {returnIcon(info, i)}
              </BorderBox>
              <ProcessLabel colorInfo={returnColor({ index: i, authStatus: info.status })}>
                {info.label}
              </ProcessLabel>
            </ProcessCard>

            <DotArea
              isDisabled={i < 3}
              colorInfo={returnColor({ index: i, authStatus: info.status })}
              isActive={
                info.status === 10 && data.status === 13 ? false : info.status < data.status
              }
              index={i}
              fail={data?.status === 11 || data.status === 12}
            >
              <Dot />
              <Dot />
              <Dot />
            </DotArea>
          </Flexbox>
        ))}
    </Flexbox>
  );
}

const breath = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0.2;
  }
`;

const ProcessCard = styled.div<{
  isAnimation: boolean;
  index: number;
  boxFade: Keyframes;
}>`
  ${({ isAnimation, index, boxFade }): CSSObject => {
    if (isAnimation && (index === 0 || index === 1)) {
      return { animation: `${boxFade} 0.7s` };
    }
    return {};
  }};
`;

const DotArea = styled.div<{
  isDisabled: boolean;
  colorInfo: ColorObject;
  isActive: boolean;
  index: number;
  fail: boolean;
}>`
  display: ${({ isDisabled }) => (isDisabled ? 'flex' : 'none')};
  align-items: center;
  gap: 5px;
  padding-bottom: 25px;
  div {
    ${({
      theme: {
        palette: { secondary, common }
      },
      colorInfo,
      fail,
      isActive,
      index
    }): CSSObject => {
      let cssObject: CSSObject = {
        background: common.line01
      };
      if (!fail && isActive) {
        cssObject = {
          background: colorInfo.color
        };
      } else if (!fail && !isActive) {
        cssObject = {
          background: common.line01
        };
      }
      if (fail && index === 0) {
        cssObject = {
          background: secondary.red.main
        };
      }
      return cssObject;
    }}
`;

const Dot = styled.div`
  width: 4px;
  height: 3px;
  border-radius: 5px;
  background: #f2f2f2;
`;

const ProcessLabel = styled(Typography)<{
  colorInfo: ColorObject;
}>`
  margin-top: 8px;
  text-align: center;
  color: ${({ colorInfo }) => colorInfo.color};
  font-weight: ${({ colorInfo, theme: { typography } }) =>
    colorInfo.active ? typography.body1.weight.bold : typography.body1.weight.medium};
  ${({ colorInfo }): CSSObject =>
    colorInfo.next ? { animation: `0.7s linear 0s infinite alternate ${breath}` } : {}};
`;

const BorderBox = styled.div<{
  colorInfo: ColorObject;
}>`
  width: 64px;
  height: 64px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ colorInfo }) => colorInfo.background};
  ${({ colorInfo }): CSSObject =>
    colorInfo.active ? { border: `3px solid ${colorInfo.color}` } : {}};
  ${({ colorInfo }): CSSObject =>
    colorInfo.next
      ? { animation: `0.7s linear 0s infinite alternate ${breath}` }
      : {
          borderColor: colorInfo.background
        }};
  ${({ colorInfo }): CSSObject => ({
    '& svg': {
      color: colorInfo.color
    }
  })};

  @media (max-width: 320px) {
    width: 50px;
    height: 50px;
  }
`;

export default LegitStatusVisualProcess;
