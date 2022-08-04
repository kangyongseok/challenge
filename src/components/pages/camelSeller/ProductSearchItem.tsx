import { useSetRecoilState } from 'recoil';
import { Box, Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import type { SuggestKeyword } from '@dto/product';

import { PreReserveDataState } from '@recoil/myPortfolio';

interface ModelSearchItemProps {
  data: SuggestKeyword;
  onClick: () => void;
}

function ProductSearchItem({ data, onClick }: ModelSearchItemProps) {
  const setReserveData = useSetRecoilState(PreReserveDataState);
  const handleClickModel = () => {
    setReserveData((props) => ({ ...props, model: data.keyword }));
    onClick();
  };

  return (
    <li>
      <Flexbox alignment="center" onClick={handleClickModel}>
        <Box customStyle={{ marginLeft: 12 }}>
          <ModelName
            weight="medium"
            variant="h4"
            dangerouslySetInnerHTML={{
              __html: data.keywordDeco
            }}
          />
        </Box>
      </Flexbox>
    </li>
  );
}

const ModelName = styled(Typography)`
  & > b {
    color: ${({ theme: { palette } }) => palette.primary.main};
  }
`;
export default ProductSearchItem;
