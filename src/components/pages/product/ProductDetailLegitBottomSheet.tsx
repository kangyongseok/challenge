import { useEffect } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useMutation } from 'react-query';
import { useRouter } from 'next/router';
import { BottomSheet, Box, CtaButton, Flexbox, Label, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Image } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import { postProductLegit } from '@api/product';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { productLegitToggleBottomSheetState } from '@recoil/productLegit';
import { deviceIdState } from '@recoil/common';

function ProductDetailLegitBottomSheet({ title, thumbnail }: { title: string; thumbnail: string }) {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const { mutate: postProductLegitMutate } = useMutation(postProductLegit);
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
          variant="contained"
          brandColor="black"
          customStyle={{ margin: 20, background: common.black }}
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
            <Image disableAspectRatio src={thumbnail} />
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
          <Typography customStyle={{ color: common.grey['60'] }}>전국 명품 전문가들이</Typography>
          <Typography customStyle={{ color: common.grey['60'] }}>
            실시간으로 정가품 의견 드릴게요
          </Typography>
        </Box>
      </Flexbox>
      <Flexbox
        alignment="center"
        customStyle={{ borderTop: `1px solid ${common.grey['90']}`, padding: 20 }}
        gap={8}
      >
        <NextCTAButton
          variant="contained"
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
        <CtaButton
          weight="bold"
          size="large"
          variant="contained"
          fullWidth
          brandColor="primary"
          onClick={() => {
            logEvent(attrKeys.legit.CLICK_LEGIT_MODAL, {
              name: attrProperty.productTitle.PRODUCT_DETAIL,
              title: attrProperty.productTitle.ABOUT_CTA,
              att: 'OK'
            });
            atomLegitBottomSheet(false);
            postProductLegitMutate(
              { id: Number(router.query.id), deviceId },
              {
                // 사진감정신청 테스트는 알렉스와 협의 후 진행
                onSuccess: () => {
                  router.push(`/products/${router.query.id}/legit?firstLegit=true`);
                }
              }
            );
          }}
        >
          실시간 사진감정받기 (무료)
        </CtaButton>
      </Flexbox>
    </BottomSheet>
  );
}

const NextCTAButton = styled(CtaButton)`
  min-width: 72px;
  padding: 0;
  background: ${({ theme: { palette } }) => palette.common.grey['95']};
`;

const ImageBox = styled.div`
  background: ${({ theme: { palette } }) => palette.primary.bgLight};
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
