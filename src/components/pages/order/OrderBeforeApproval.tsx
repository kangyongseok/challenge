import { Box, Button, Flexbox, Image, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

function OrderBeforeApproval({
  isBottomSheet,
  setSafePaymentBanner
}: {
  isBottomSheet?: boolean;
  setSafePaymentBanner?: (value: boolean) => void;
}) {
  const data = [
    {
      texts: (
        <Typography variant="h4">
          구매자가 결제하면
          <br />
          연락처로 주문서가 발송돼요!
        </Typography>
      ),
      img: `https://${process.env.IMAGE_DOMAIN}/assets/images/order/board_image.png`,
      alt: '보드이미지'
    },
    {
      texts: (
        <Typography variant="h4">
          판매승인 후 카멜에게
          <br />
          택배를 착불로 보내주세요.
        </Typography>
      ),
      img: `https://${process.env.IMAGE_DOMAIN}/assets/images/order/box_image.png`,
      alt: '포장박스 이미지'
    },
    {
      texts: (
        <>
          <Typography variant="h4">
            카멜에서 상품을 확인 후
            <br />
            <span style={{ fontWeight: 'bold', color: '#425BFF' }}>즉시 정산</span>
            됩니다.
          </Typography>
          <Typography variant="body3" color="ui60" customStyle={{ marginTop: 12 }}>
            사진 및 설명과 다름이 없는지 확인합니다.
          </Typography>
        </>
      ),
      img: `https://${process.env.IMAGE_DOMAIN}/assets/images/order/money_image.png`,
      alt: '돈다발 이미지',
      bg: '#E5E9FF'
    },
    {
      texts: (
        <Typography variant="h4">
          확인된 매물은 구매자에게
          <br />
          안전하게 배송됩니다.
        </Typography>
      ),
      img: `https://${process.env.IMAGE_DOMAIN}/assets/images/order/smile_image.png`,
      alt: '스마일 이미지'
    }
  ];

  return (
    <Wrap isBottomSheet={isBottomSheet}>
      <Typography weight="bold" variant="h2" customStyle={{ textAlign: 'center' }}>
        안전결제도
        <br />
        빨리 정산 받을 수 있어요!
      </Typography>
      <Typography color="ui60" customStyle={{ marginTop: 12, textAlign: 'center' }}>
        구매확정 기다릴 필요 없이
        <br />
        택배 발송 후 1~2일이면 정산이 완료됩니다.
      </Typography>
      <Flexbox gap={12} direction="vertical" customStyle={{ marginTop: 32 }}>
        {data.map(({ texts, img, alt, bg }, index) => {
          return (
            <Content key={`before-approval-${index + 1}`} alignment="center" bg={bg}>
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
      {isBottomSheet && (
        <ButtonWrap alignment="center" justifyContent="center">
          <Button
            fullWidth
            size="xlarge"
            variant="solid"
            brandColor="black"
            onClick={() => setSafePaymentBanner && setSafePaymentBanner(false)}
          >
            확인했어요
          </Button>
        </ButtonWrap>
      )}
    </Wrap>
  );
}

const Wrap = styled.section<{ isBottomSheet?: boolean }>`
  padding: 52px 0;
  padding-bottom: ${({ isBottomSheet }) => (isBottomSheet ? 100 : 52)}px;
`;

const Content = styled(Flexbox)<{ bg?: string }>`
  background: ${({
    theme: {
      palette: { common }
    },
    bg
  }) => bg || common.bg02};
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

export default OrderBeforeApproval;
