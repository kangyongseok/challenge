import { BottomSheet, Box, Button, Flexbox, Image, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

function ProductOrderInfoBottomSheet({
  open,
  setOpen
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const data = [
    {
      texts: (
        <>
          <Typography variant="h4">
            구매자가 결제하면
            <br />
            판매자에게 주문서가 발송돼요!
          </Typography>
          <Typography variant="body3" color="ui60" customStyle={{ marginTop: 12 }}>
            문의사항은 판매자에게 직접 연락해주세요.
          </Typography>
        </>
      ),
      img: `https://${process.env.IMAGE_DOMAIN}/assets/images/order/board_image.png`,
      alt: '보드이미지'
    },
    {
      texts: (
        <>
          <Typography variant="h4">
            판매승인 후 카멜이 매물을 받고
            <br />
            확인합니다.
          </Typography>
          <Typography variant="body3" color="ui60" customStyle={{ marginTop: 12 }}>
            사진 및 설명과 다름이 없는지 확인합니다.
          </Typography>
        </>
      ),
      img: `https://${process.env.IMAGE_DOMAIN}/assets/images/order/box_image.png`,
      alt: '포장박스 이미지'
    },
    {
      texts: (
        <>
          <Typography variant="h4">
            확인된 매물은 구매자에게
            <br />
            안전하게 배송됩니다.
          </Typography>
          <Typography variant="body3" color="ui60" customStyle={{ marginTop: 12 }}>
            판매자 발송 후 배송완료까지 평균 7일 소요됩니다.
          </Typography>
        </>
      ),
      img: `https://${process.env.IMAGE_DOMAIN}/assets/images/order/smile_image.png`,
      alt: '스마일 이미지'
    }
  ];

  return (
    <BottomSheet open={open} onClose={() => setOpen(false)} disableSwipeable>
      <Wrap>
        <Typography weight="bold" variant="h2" customStyle={{ textAlign: 'center' }}>
          구매대행 요청,
          <br />
          이렇게 진행됩니다.
        </Typography>
        <Flexbox gap={12} direction="vertical" customStyle={{ marginTop: 32 }}>
          {data.map(({ texts, img, alt }, index) => {
            return (
              <Content key={`before-approval-${index + 1}`} alignment="center">
                <Box>
                  <Typography weight="bold" variant="h4" customStyle={{ marginBottom: 8 }}>
                    0{index + 1}
                  </Typography>
                  {texts}
                </Box>
                <Image
                  disableAspectRatio
                  src={img}
                  alt={alt}
                  width={68}
                  height={68}
                  customStyle={{ marginLeft: 'auto' }}
                />
              </Content>
            );
          })}
        </Flexbox>
        <ButtonWrap alignment="center" justifyContent="center">
          <Button
            fullWidth
            size="xlarge"
            variant="solid"
            brandColor="black"
            onClick={() => setOpen(false)}
          >
            확인했어요
          </Button>
        </ButtonWrap>
      </Wrap>
    </BottomSheet>
  );
}

const Wrap = styled.section<{ isBottomSheet?: boolean }>`
  padding: 52px 20px 100px;
`;

const Content = styled(Flexbox)`
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg02};
  width: 100%;
  min-height: 108px;
  border-radius: 12px;
  padding: 20px;
`;

const ButtonWrap = styled(Flexbox)`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 0 20px 20px 20px;
  background: white;
`;

export default ProductOrderInfoBottomSheet;
