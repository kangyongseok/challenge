/* eslint-disable react/no-unescaped-entities */

import { Box, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { QnaList } from '@components/pages/qna';

function Qna() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  return (
    <GeneralTemplate
      header={
        <Header hideHeart hideLine={false} rightIcon={<Box customStyle={{ width: 56 }} />}>
          <Typography weight="bold" variant="h3">
            자주 묻는 질문
          </Typography>
        </Header>
      }
      footer={
        <Box customStyle={{ padding: 20, borderTop: `1px solid ${common.line01}` }}>
          <Typography variant="small2" color="ui60">
            (주)미스터카멜은 통신판매중개자로서 거래 당사자가 아니며, 판매 회원과 구매 회원 간의
            상품정보 및 거래에 대해 책임을 지지 않습니다. 또한 상품에 직접 관여하지 않으며, 상품
            주문, 배송 및 환불의 의무와 책임은 각 판매자에게 있습니다.
          </Typography>
        </Box>
      }
    >
      <QnaList />
    </GeneralTemplate>
  );
}

export default Qna;
