import { Flexbox, Typography } from '@mrcamelhub/camel-ui';

function OrdersDetailPolicy() {
  return (
    <Flexbox
      component="section"
      direction="vertical"
      gap={12}
      customStyle={{
        padding: '20px 20px 32px'
      }}
    >
      <Typography variant="body2" color="ui60">
        (주)미스터카멜은 통신판매중개자로서 거래 당사자가 아니며, 판매자가 등록한 상품정보 및 거래에
        대해 책임을 지지 않습니다.
      </Typography>
      <Typography variant="body2" color="ui60">
        거래분쟁이 있다면 마이 {'>'} 1:1문의로 접수해주세요.
      </Typography>
    </Flexbox>
  );
}

export default OrdersDetailPolicy;
