import { useEffect } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useMutation } from 'react-query';
import { useRouter } from 'next/router';
import { BottomSheet, Box, Button, Flexbox, Image, Label, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import type { Product } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { postRequestProductLegits } from '@api/productLegit';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { productLegitToggleBottomSheetState } from '@recoil/productLegit';
import { deviceIdState } from '@recoil/common';

function ProductDetailLegitBottomSheet({ product }: { product?: Product }) {
  const router = useRouter();
  const splitIds = String(router.query.id || '').split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);
  const { title, imageThumbnail, imageMain } = product || {};
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const { mutate: postProductLegitsMutate } = useMutation(postRequestProductLegits);
  const [legitBottomSheet, atomLegitBottomSheet] = useRecoilState(
    productLegitToggleBottomSheetState
  );
  const deviceId = useRecoilValue(deviceIdState);

  useEffect(() => {
    if (legitBottomSheet) {
      logEvent(attrKeys.legit.VIEW_LEGIT_MODAL, {
        name: attrProperty.productName.PRODUCT_DETAIL,
        title: attrProperty.productTitle.ABOUT_CTA
      });
    }
  }, [legitBottomSheet]);

  useEffect(() => {
    return () => {
      atomLegitBottomSheet(false);
    };
  }, [atomLegitBottomSheet]);

  return (
    // eslint-disable-next-line no-console
    <BottomSheet
      open={legitBottomSheet}
      onClose={() => {
        //
      }}
      disableSwipeable
    >
      <ImageBox>
        <Label
          text="NEW"
          variant="solid"
          brandColor="black"
          customStyle={{ margin: 20, background: common.uiBlack }}
          size="xsmall"
        />
        <Box customStyle={{ width: 168, margin: '0 auto', position: 'relative', top: -15 }}>
          <ImageMobileMock
            src={`https://${process.env.IMAGE_DOMAIN}/assets/img/legit_mock_mobile_img.png`}
            alt="legit_mock_mobile_img"
            width={168}
          />
          <ImageFake
            src={`https://${process.env.IMAGE_DOMAIN}/assets/img/legit_fake_icon.png`}
            alt="legit_fake_icon"
            width={72}
          />
          <ImageGenuine
            src={`https://${process.env.IMAGE_DOMAIN}/assets/img/legit_genuine_icon.png`}
            alt="legit_genuine_icon"
            width={80}
          />
          <MockBackground alignment="center" justifyContent="center">
            <Image disableAspectRatio src={imageThumbnail || imageMain || ''} alt="Thumbnail Img" />
          </MockBackground>
        </Box>
      </ImageBox>
      <Flexbox direction="vertical" gap={8} customStyle={{ margin: '32px 0', textAlign: 'center' }}>
        <Box customStyle={{ padding: '0 20px' }}>
          <Typography
            weight="bold"
            variant="h3"
            customStyle={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {title}
          </Typography>
          <Typography weight="bold" variant="h3">
            정품인지 궁금하신가요?
          </Typography>
        </Box>
        <Box>
          <Typography customStyle={{ color: common.ui60 }}>전국 명품 전문가들이</Typography>
          <Typography customStyle={{ color: common.ui60 }}>
            실시간으로 정가품 의견 드릴게요
          </Typography>
        </Box>
      </Flexbox>
      <Flexbox
        alignment="center"
        customStyle={{ borderTop: `1px solid ${common.ui90}`, padding: 20 }}
        gap={8}
      >
        <NextCTAButton
          variant="solid"
          size="large"
          onClick={() => {
            logEvent(attrKeys.legit.CLICK_LEGIT_MODAL, {
              name: attrProperty.productTitle.PRODUCT_DETAIL,
              title: attrProperty.productTitle.ABOUT_CTA,
              att: 'CLOSE'
            });
            atomLegitBottomSheet(false);
          }}
        >
          <Typography>다음에</Typography>
        </NextCTAButton>
        <Button
          weight="bold"
          size="large"
          variant="solid"
          fullWidth
          brandColor="primary"
          onClick={() => {
            logEvent(attrKeys.legit.SUBMIT_LEGIT_PROCESS, {
              name: attrProperty.productTitle.PRODUCT_DETAIL,
              type: 'PRODUCT',
              data: product
            });
            atomLegitBottomSheet(false);
            postProductLegitsMutate(
              { productIds: [productId], deviceId },
              {
                onSuccess: () => {
                  router.push(`/legit/${router.query.id}?firstLegit=true`);
                }
              }
            );
          }}
        >
          실시간 사진감정받기 (무료)
        </Button>
      </Flexbox>
    </BottomSheet>
  );
}

const NextCTAButton = styled(Button)`
  min-width: 72px;
  padding: 0;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui95};
`;

const ImageBox = styled.div`
  background: ${({
    theme: {
      palette: { primary }
    }
  }) => primary.bgLight};
  width: 100%;
  height: 240px;
  overflow: hidden;
`;

const ImageMobileMock = styled.img``;
const ImageFake = styled.img`
  position: absolute;
  top: 53px;
  right: -35px;
  z-index: 5;
`;
const ImageGenuine = styled.img`
  position: absolute;
  top: 14px;
  left: -41px;
  z-index: 5;
`;
const MockBackground = styled(Flexbox)`
  width: 146px;
  height: 146px;
  position: absolute;
  bottom: 0;
  left: 11px;
  overflow: hidden;
`;

export default ProductDetailLegitBottomSheet;
