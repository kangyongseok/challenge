import { Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { checkAgent } from '@utils/common';

function ProductCamelGuardText() {
  if (!(checkAgent.isIOSApp() || checkAgent.isAndroidApp())) return null;
  return (
    <CamelGuardText>
      <Typography variant="small2" color="ui60" customStyle={{ wordBreak: 'keep-all' }}>
        (주)미스터카멜은 통신판매중개자로서 거래 당사자가 아니며, 판매 회원과 구매 회원 간의
        상품정보 및 거래에 대해 책임을 지지 않습니다. 또한 상품에 직접 관여하지 않으며, 상품 주문,
        배송 및 환불의 의무와 책임은 각 판매자에게 있습니다.
      </Typography>
    </CamelGuardText>
  );
}

const CamelGuardText = styled.div`
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg03};
  padding: 20px;
  width: calc(100% + 40px);
  margin-left: -20px;
  padding-bottom: 52px;
`;

export default ProductCamelGuardText;
