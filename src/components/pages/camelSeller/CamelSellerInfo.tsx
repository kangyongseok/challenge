import { useEffect, useState } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Box, Button, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import type { ProductLegit } from '@dto/productLegit';

import { fetchSurvey } from '@api/user';
import { fetchProduct } from '@api/product';

import queryKeys from '@constants/queryKeys';
import {
  EVENT_END_DATE,
  EVENT_START_DATE,
  HEADER_HEIGHT,
  NEXT_IMAGE_BLUR_URL
} from '@constants/common';

import { scrollDisable, scrollEnable } from '@utils/scroll';
import { EventTime } from '@utils/eventTimes';
import { checkAgent } from '@utils/common';

import { deviceIdState, dialogState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import { EventFullImage, EventRegisterDialog } from '../event';

function CamelSellerInfo() {
  const router = useRouter();
  const { id: productId } = router.query;

  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();

  const deviceId = useRecoilValue(deviceIdState);

  const [openEventPage, setOpenEventPage] = useState(false);
  const evnetDateInfo = EventTime(EVENT_START_DATE, EVENT_END_DATE);
  const isMoweb = !(checkAgent.isIOSApp() || checkAgent.isAndroidApp());
  const { data: accessUser } = useQueryAccessUser();
  const setDialogState = useSetRecoilState(dialogState);
  const [isOpen, setIsOpen] = useState(false);
  const { data, refetch } = useQuery(queryKeys.client.survey(), fetchSurvey, {
    enabled: !!accessUser,
    refetchOnMount: true
  });

  useEffect(() => {
    if (openEventPage) {
      scrollDisable();
      refetch();
    } else {
      scrollEnable();
    }
  }, [openEventPage, refetch]);

  const { data: { product: { productLegit = {} } = {} } = {} } = useQuery(
    queryKeys.products.sellerEditProduct({ productId: Number(productId), deviceId }),
    () => fetchProduct({ productId: Number(productId), deviceId }),
    {
      enabled: !!productId,
      refetchOnMount: 'always'
    }
  );

  const { status, result } = (productLegit as ProductLegit) || {};

  if (evnetDateInfo.isEvent) {
    return (
      <>
        <Wrap
          alignment="center"
          gap={6}
          // onClick={() => router.push('/events/camelSellerEvent')}
          onClick={() => setOpenEventPage(true)}
          css={{
            height: 'auto',
            padding: '12px 22px',
            backgroundColor: common.uiBlack
          }}
        >
          <Icon name="BangCircleFilled" size="small" customStyle={{ color: common.uiWhite }} />
          <Typography variant="body2" customStyle={{ color: common.uiWhite }}>
            매물등록을 완료하고 이벤트에 참여해보세요!
          </Typography>
          <Box customStyle={{ position: 'absolute', bottom: 0, right: 0 }}>
            <Image
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/events/seller_event_group.png`}
              alt="매물등록 이벤트 참여 이미지"
              placeholder="blur"
              blurDataURL={NEXT_IMAGE_BLUR_URL}
              width={130}
              height={57}
            />
          </Box>
        </Wrap>
        {openEventPage && (
          <Box
            customStyle={{
              position: 'fixed',
              top: 0,
              left: 0,
              zIndex: 10,
              background: 'white',
              width: '100%',
              height: '100vh',
              overflow: 'auto'
            }}
          >
            <Box
              onClick={() => setOpenEventPage(false)}
              customStyle={{ padding: 16, maxHeight: HEADER_HEIGHT }}
            >
              <Icon name="CloseOutlined" />
            </Box>
            <EventFullImage />
            <FixButton
              justifyContent="center"
              alignment="center"
              style={{ position: 'fixed', bottom: 0, left: 0, width: '100%' }}
              isEvent={evnetDateInfo.isEvent}
            >
              {evnetDateInfo.isEvent ? (
                <Button
                  fullWidth
                  size="xlarge"
                  variant="solid"
                  onClick={() => {
                    if (!isMoweb && accessUser && evnetDateInfo.isEvent) {
                      if (!data) {
                        setIsOpen(true);
                        return;
                      }
                    }
                    if (!evnetDateInfo.isEvent) {
                      setDialogState({
                        type: 'endEvent',
                        customStyleTitle: { minWidth: 311 }
                      });
                      return;
                    }
                    setOpenEventPage(false);
                  }}
                >
                  {isMoweb ? '카멜앱에서 판매 시작하기' : '판매 시작하기'}
                </Button>
              ) : (
                <Button fullWidth size="xlarge" variant="ghost">
                  {!evnetDateInfo.isStart && '이벤트 준비중입니다.'}
                  {!evnetDateInfo.isEnd && '종료된 이벤트입니다.'}
                </Button>
              )}
            </FixButton>
          </Box>
        )}
        <EventRegisterDialog
          open={isOpen}
          close={() => {
            setOpenEventPage(false);
            setIsOpen(false);
          }}
        />
      </>
    );
  }

  if (status === 20) {
    return (
      <Wrap alignment="center" gap={6} onClick={() => router.push('/camelSeller/guide')}>
        <Icon name="LegitFilled" size="small" customStyle={{ color: common.uiWhite }} />
        <Typography variant="body2" customStyle={{ color: common.uiWhite }}>
          감정중인 매물은 카테고리/브랜드를 변경할 수 없어요.
        </Typography>
      </Wrap>
    );
  }

  if (status === 30 && result === 1) {
    return (
      <Wrap
        alignment="flex-start"
        gap={6}
        css={{
          height: 'auto',
          padding: '12px 22px',
          backgroundColor: primary.light
        }}
      >
        <Icon name="ShieldFilled" size="small" customStyle={{ color: common.uiWhite }} />
        <Typography variant="body2" customStyle={{ color: common.uiWhite }}>
          정품인증 마크를 받았어요! 감정한 매물은 카테고리/브랜드를 변경할 수 없어요.
        </Typography>
      </Wrap>
    );
  }

  return (
    <Wrap alignment="center" gap={6} onClick={() => router.push('/camelSeller/guide')}>
      <Icon name="BangCircleFilled" size="small" customStyle={{ color: common.uiWhite }} />
      <Typography variant="body2" customStyle={{ color: common.uiWhite }}>
        사진 등록 전 <span style={{ textDecoration: 'underline' }}>사진업로드 가이드</span>를 꼭
        확인해주세요!
      </Typography>
    </Wrap>
  );
}

const Wrap = styled(Flexbox)`
  width: calc(100% + 40px);
  height: 40px;
  background: ${({ theme: { palette } }) => palette.common.ui20};
  margin-left: -20px;
  padding: 0 22px;
  position: relative;
`;

const FixButton = styled(Flexbox)<{ isEvent: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 56px;
  background: ${({
    theme: {
      palette: { common }
    },
    isEvent
  }) => (isEvent ? common.ui20 : common.ui95)};
  ${({ isEvent }) =>
    isEvent &&
    `button {
    background: none;
    border: none;
    color: #ffda46;
    font-weight: 900;
    font-size: 20px;
  }`}
`;

export default CamelSellerInfo;
