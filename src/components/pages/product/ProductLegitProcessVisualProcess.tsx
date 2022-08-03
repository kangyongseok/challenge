/* eslint-disable no-nested-ternary */
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Flexbox, Typography, useTheme } from 'mrcamel-ui';
import { isEmpty } from 'lodash-es';
import styled from '@emotion/styled';
import type { CSSObject } from '@emotion/styled';
import { Keyframes, keyframes } from '@emotion/react';

import { logEvent } from '@library/amplitude';

import { fetchProductLegit } from '@api/product';

import queryKeys from '@constants/queryKeys';
import authInfoIcon from '@constants/authInfoIcon';
import attrKeys from '@constants/attrKeys';

import { animationKeyframesState, firstUserAnimationState } from '@recoil/productLegitProcess';

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

function ProductLegitProcessVisualProcess() {
  const router = useRouter();
  const setTimeoutRef = useRef<NodeJS.Timeout>();
  const productId = Number(router.query.id);
  const {
    theme: {
      palette: { common, primary, secondary }
    }
  } = useTheme();
  const { data } = useQuery(
    queryKeys.products.productLegit({ productId }),
    () => fetchProductLegit(productId),
    {
      enabled: !!router.query.id,
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
    if (data?.status === 30) {
      router.replace(`/products/${productId}/legit/result`);
    }
  }, [data, productId, router]);

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

      if (isFirstLegit) {
        // 최초 접근시
        if (isAnimation && index === 1) {
          return colorObject;
        }
        if (index === 0) {
          if (isAnimation) {
            return { ...colorObject, color: common.black, next: false };
          }
          return colorObject;
        }
      } else {
        const fail = data?.status === 11;
        if (fail && index === 1) {
          return { ...colorObject, color: secondary.red.main, next: false };
        }
        if (data && authStatus < data.status) {
          return { ...colorObject, color: common.black, next: false };
        }
        if (data && authStatus === data.status) {
          return colorObject;
        }
      }
      return { color: common.grey['80'], background: common.grey['95'] };
    },
    [primary.main, isFirstLegit, common.grey, common.black, isAnimation, data, secondary.red.main]
  );

  const returnIcon = (info: ProcessInfo, i: number) => {
    if (data) {
      if (isFirstLegit) {
        if (isAnimation && i === 0) {
          return <authInfoIcon.ApproveIcon />;
        }
      } else {
        const fail = data.status === 11;
        if (fail) {
          if (i === 1) {
            return info.imgName(returnColor({ index: i, authStatus: info.status }).color);
          }
          if (i > 1) {
            return <authInfoIcon.ErrorIcon />;
          }
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
      customStyle={{ margin: `104px 0 ${data?.status === 11 ? 64 : 100}px`, minHeight: 93 }}
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
              isActive={info.status < data.status}
              fail={data?.status === 11 && i >= 1}
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
  fail: boolean;
}>`
  display: ${({ isDisabled }) => (isDisabled ? 'flex' : 'none')};
  align-items: center;
  gap: 5px;
  padding-bottom: 25px;
  div {
    background: ${({ colorInfo, fail, isActive }) =>
      !fail ? (isActive ? colorInfo.color : '#f2f2f2') : 'none'};
  }
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
    colorInfo.next ? { animation: `0.7s linear 0s infinite alternate ${breath}` } : {}};
  ${({ colorInfo }): CSSObject =>
    colorInfo.active ? { border: `3px solid ${colorInfo.color}` } : {}};

  @media (max-width: 320px) {
    width: 50px;
    height: 50px;
  }
`;

export default ProductLegitProcessVisualProcess;
