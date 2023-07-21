import { useEffect } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Flexbox,
  Icon,
  Image,
  ThemeProvider,
  Typography,
  useTheme
} from '@mrcamelhub/camel-ui';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { QnaList } from '@components/pages/qna';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getImageResizePath } from '@utils/common';

function Operator() {
  const {
    theme: { zIndex }
  } = useTheme();

  const router = useRouter();

  useEffect(() => {
    logEvent(attrKeys.guide.VIEW_CAMEL_GUIDE, {
      title: attrProperty.title.OPERATOR
    });
  }, []);

  const reviews = [
    'operator_guide_review01.png',
    'operator_guide_review02.png',
    'operator_guide_review03.png',
    'operator_guide_review04.png'
  ];

  return (
    <ThemeProvider theme="dark">
      <GeneralTemplate
        customStyle={{ height: 'fit-content' }}
        header={
          <Header
            hideTitle
            rightIcon={<div />}
            leftIcon={
              <Icon
                name="CloseOutlined"
                customStyle={{ marginLeft: 16 }}
                onClick={() => router.back()}
              />
            }
          />
        }
        footer={
          <Flexbox
            direction="vertical"
            alignment="center"
            justifyContent="center"
            customStyle={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              width: '100%',
              zIndex: zIndex.button + 1
            }}
          >
            <Box
              customStyle={{
                background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, #000 100%)',
                height: 32,
                width: '100%',
                marginBottom: -5
              }}
            />
            <Box customStyle={{ padding: '0 20px 20px 20px', width: '100%', background: 'black' }}>
              <Button
                fullWidth
                variant="solid"
                brandColor="primary"
                size="xlarge"
                onClick={() => router.back()}
              >
                계속 거래하기
              </Button>
            </Box>
          </Flexbox>
        }
      >
        <Flexbox direction="vertical" gap={30} customStyle={{ marginBottom: 52 }}>
          <Box>
            <Image
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/guide/operator_guide01-1.png`,
                w: 350
              })}
              alt="예시 채팅 이미지"
              disableAspectRatio
            />
          </Box>
          <Box>
            <Image
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/guide/operator_guide02.png`,
                w: 350
              })}
              alt="전국 중고명품 대신 거래해드려요!"
              disableAspectRatio
            />
          </Box>
          <Box>
            <Image
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/guide/operator_guide03.png`,
                w: 350
              })}
              alt="모든 플랫폼, 전국 매물을 구매문의부터 직거래 대행까지 정품검수로 사기없이 안전결제"
              disableAspectRatio
            />
          </Box>
          <Box>
            <Image
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/guide/operator_guide04.png`,
                w: 350
              })}
              alt="카멜 구매대행 어떻게 진행되나요?"
              disableAspectRatio
            />
          </Box>
          <Box>
            <Image
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/guide/operator_guide05.png`,
                w: 350
              })}
              alt="가장 싸고 좋은 매물이 보여있는 당근마켓도 카멜 구매대행!"
              disableAspectRatio
            />
          </Box>
        </Flexbox>
        <Flexbox direction="vertical" gap={20} customStyle={{ marginBottom: 60, marginTop: 30 }}>
          <Typography weight="bold" variant="h2">
            카멜 구매대행을 이용한
            <br />
            유저들의 후기를 만나보세요!
          </Typography>
          <Swiper
            spaceBetween={10}
            slidesPerView="auto"
            style={{ width: 'calc(100% + 40px)', marginLeft: -20, padding: '0 20px' }}
          >
            {reviews.map((review) => (
              <SwiperSlide key={`operator-${review}`} style={{ width: '80%' }}>
                <Box>
                  <Image
                    src={`https://${process.env.IMAGE_DOMAIN}/assets/images/guide/${review}`}
                    alt="리뷰"
                    disableAspectRatio
                  />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </Flexbox>
        <QnaList type="operator" />
      </GeneralTemplate>
    </ThemeProvider>
  );
}

export default Operator;
