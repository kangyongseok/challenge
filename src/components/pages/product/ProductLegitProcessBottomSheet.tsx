import { useEffect, useRef, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { BottomSheet, Box, CtaButton, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import styled from '@emotion/styled';

import { TouchIcon } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import { fetchProductLegit } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  firstUserAnimationState,
  processBottomSheetOpenTriggerState
} from '@recoil/productLegitProcess';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

const notWorkingDay = [0, 6];
const norWorkingTime =
  Number(dayjs().format('HHmm')) < 1000 || Number(dayjs().format('HHmm')) > 1900;

function ProductLegitProcessBottomSheet() {
  const router = useRouter();
  const setTimeoutRef = useRef<NodeJS.Timeout>();
  const [isNotWorking, setIsNotWorking] = useState(false);
  const [openBottomSheet, setOpenBottomSheet] = useState(false);
  const { data: accessUser } = useQueryAccessUser();
  const isAnimation = useRecoilValue(firstUserAnimationState);
  const openTrigger = useRecoilValue(processBottomSheetOpenTriggerState);
  const productId = Number(router.query.id);
  const { data } = useQuery(
    queryKeys.products.productLegit({ productId }),
    () => fetchProductLegit(productId),
    {
      enabled: !!router.query.id
    }
  );

  useEffect(() => {
    if (notWorkingDay.includes(dayjs().day()) || norWorkingTime) {
      setIsNotWorking(true);
    }
  }, []);

  useEffect(() => {
    if (openTrigger && router.query.firstLegit === 'true') {
      if (isAnimation && data?.status === 10) {
        bottomSheetOpenCount();
      }
    } else if (openTrigger && data?.status === 10) {
      bottomSheetOpenCount();
    }
    return () => clearTimeout(setTimeoutRef.current);
  }, [isAnimation, data, router, openTrigger]);

  const bottomSheetOpenCount = () => {
    setTimeoutRef.current = setTimeout(() => {
      logEvent(attrKeys.legit.VIEW_LEGIT_MODAL, {
        name: attrProperty.productName.LEGIT_PRODUCT,
        title: attrProperty.productTitle.PRE_CONFIRM,
        subTitle: 'INFO'
      });
      setOpenBottomSheet(true);
    }, 4000);
  };

  const handleClick = () => {
    if (accessUser) {
      logEvent(attrKeys.legit.CLICK_LEGIT_MODAL, {
        name: attrProperty.productName.LEGIT_PRODUCT,
        title: attrProperty.productTitle.PRE_CONFIRM,
        subTitle: 'INFO',
        att: 'OK'
      });
      router.push({ pathname: '/legit', query: { tab: 'my' } });
    } else {
      logEvent(attrKeys.legit.CLICK_LEGIT_MODAL, {
        name: attrProperty.productName.LEGIT_PRODUCT,
        title: attrProperty.productTitle.PRE_CONFIRM,
        subTitle: 'LOGIN',
        att: 'OK'
      });
      router.push({ pathname: '/login', query: { returnUrl: router.asPath } });
    }
  };

  return (
    <BottomSheet
      disableSwipeable
      open={openBottomSheet}
      onClose={() => setOpenBottomSheet(false)}
      customStyle={{ padding: 20, textAlign: 'center', position: 'relative' }}
    >
      <Flexbox alignment="center" justifyContent="center">
        <Typography variant="h2" customStyle={{ textAlign: 'center', width: '100%' }}>
          🔔
        </Typography>
        <TouchIcon
          name="CloseOutlined"
          size="medium"
          direction="right"
          onClick={() => setOpenBottomSheet(false)}
          wrapCustomStyle={{ position: 'absolute', top: 15, right: 10 }}
        />
      </Flexbox>
      {accessUser && isNotWorking && <OverTime />}
      {!accessUser && <NotAppUser />}
      {accessUser && !isNotWorking && <Basic />}
      <CtaButton
        fullWidth
        brandColor="primary"
        variant="contained"
        size="large"
        customStyle={{ marginTop: 20 }}
        onClick={handleClick}
      >
        {!accessUser ? '⚡ 3초 로그인 하기' : '내 사진감정 목록보기'}
      </CtaButton>
    </BottomSheet>
  );
}

const TextFrame = styled.div<{ top?: number; radius?: number }>`
  background: ${({ theme: { palette } }) => palette.common.grey['95']};
  padding: 8px 16px;
  border-radius: ${({ radius }) => radius || 8}px;
  display: inline-block;
  margin-top: ${({ top }) => top || 0}px;
`;

function Basic() {
  const {
    theme: { palette }
  } = useTheme();
  return (
    <>
      <Typography weight="bold" variant="h3" customStyle={{ margin: '4px 0' }}>
        감정완료까지 1시간 정도 소요돼요!
      </Typography>
      <Typography>감정이 시작되면 앱푸시로 알려드릴테니</Typography>
      <Typography>조금만 기다려주세요!</Typography>
      <TextFrame top={32}>
        <Typography weight="medium" customStyle={{ color: palette.common.grey['60'] }}>
          알림을 끄셨다면 사진감정 결과를 받을 수 없어요!
        </Typography>
        <Typography variant="small1" customStyle={{ color: palette.common.grey['20'] }}>
          알림켜기: 휴대폰 설정 {'>'} 알림 {'>'} Camel 허용
        </Typography>
      </TextFrame>
    </>
  );
}
function OverTime() {
  const {
    theme: { palette }
  } = useTheme();
  return (
    <>
      <Typography weight="bold" variant="h3" customStyle={{ margin: '4px 0' }}>
        감정완료까지 1시간 정도 소요돼요!
      </Typography>
      <Typography>감정이 시작되면 앱푸시로 알려드릴게요</Typography>
      <TextFrame top={10} radius={17}>
        <Typography variant="small1" customStyle={{ color: palette.common.grey['20'] }}>
          알림켜기: 휴대폰 설정 {'>'} 알림 {'>'} Camel 허용
        </Typography>
      </TextFrame>
      <Box customStyle={{ marginTop: 32 }}>
        <Typography variant="small1" customStyle={{ color: palette.common.grey['20'] }}>
          사진감정 운영은 평일 10~19시이며,
        </Typography>
        <Typography variant="small1" customStyle={{ color: palette.common.grey['20'] }}>
          이외의 신청건은 운영시간에 순차적으로 진행됩니다
        </Typography>
      </Box>
    </>
  );
}
function NotAppUser() {
  const {
    theme: { palette }
  } = useTheme();

  return (
    <>
      <Typography weight="bold" variant="h3" customStyle={{ marginTop: 4 }}>
        사진감정 결과를 보시려면
      </Typography>
      <Typography weight="bold" variant="h3">
        로그인이 필요해요!
      </Typography>
      <TextFrame top={32}>
        <Typography variant="small1" customStyle={{ color: palette.common.grey['20'] }}>
          로그인 후 알림켜주시면, 앱푸시로 알려드릴게요 :)
        </Typography>
        <Typography variant="small1" customStyle={{ color: palette.common.grey['60'] }}>
          알림켜기: 휴대폰 설정 {'>'} 알림 {'>'} Camel 허용
        </Typography>
      </TextFrame>
    </>
  );
}

export default ProductLegitProcessBottomSheet;
