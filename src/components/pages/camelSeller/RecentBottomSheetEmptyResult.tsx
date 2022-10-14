import { Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { CamelSellerLocalStorage } from '@typings/camelSeller';

function RecentBottomSheetEmptyResult({ camelSeller }: { camelSeller: CamelSellerLocalStorage }) {
  return (
    <Flexbox
      justifyContent="center"
      alignment="center"
      direction="vertical"
      customStyle={{ height: '40%' }}
    >
      <EmptyResultEmoji justifyContent="center" alignment="center">
        😮
      </EmptyResultEmoji>
      <Typography variant="h4" weight="bold" customStyle={{ margin: '20px 0 8px' }}>
        검색 결과가 없어요.
      </Typography>
      <Typography>{camelSeller?.keyword}은</Typography>
      <Typography>최근에 거래된 매물이 없어요</Typography>
    </Flexbox>
  );
}

const EmptyResultEmoji = styled(Flexbox)`
  width: 52px;
  height: 52px;
  font-size: 52px;
  border-radius: 20px;
`;

export default RecentBottomSheetEmptyResult;
