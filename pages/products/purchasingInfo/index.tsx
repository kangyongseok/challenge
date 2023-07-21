/* eslint-disable react/no-unescaped-entities */
import { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Icon, Image, ThemeProvider, useTheme } from '@mrcamelhub/camel-ui';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { QnaList } from '@components/pages/qna';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import { getImageResizePath } from '@utils/common';

function PurchasingInfo() {
  const {
    theme: { zIndex }
  } = useTheme();

  const step2Ref = useRef(null);

  const router = useRouter();

  useEffect(() => {
    if (router.query.step === '2') {
      setTimeout(() => {
        const { offsetTop } = step2Ref.current as unknown as HTMLElement;
        window.scrollTo({
          top: offsetTop - 100,
          behavior: 'smooth'
        });
      }, 300);
    }
  }, [router.query.step]);

  useEffect(() => {
    logEvent(attrKeys.productOrder.VIEW_CAMEL_GUIDE);
  }, []);

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
        <Flexbox direction="vertical" gap={12} customStyle={{ marginBottom: 52 }}>
          <Box>
            <Image
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/product-order/operator_fee_info01.png`,
                w: 350
              })}
              alt="믿고 거래하는 카멜 중고거래"
              disableAspectRatio
            />
          </Box>
          <Box>
            <Image
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/product-order/operator_fee_info02.png`,
                w: 350
              })}
              alt="카멜 안전결제란?"
              disableAspectRatio
            />
          </Box>
          <Box ref={step2Ref} onClick={() => router.replace('/guide/operator')}>
            <Image
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/product-order/operator_fee_info03-1.png`,
                w: 350
              })}
              alt="전국 중고명품, 카멜이 대신 거래해드려요"
              disableAspectRatio
            />
          </Box>
          <Box>
            <Image
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/product-order/operator_fee_info04.png`,
                w: 350
              })}
              alt="카멜 인증판매자와 안심하고 거래하세요"
              disableAspectRatio
            />
          </Box>
        </Flexbox>
        <QnaList />
      </GeneralTemplate>
    </ThemeProvider>
  );
}

export default PurchasingInfo;
