import { useSetRecoilState } from 'recoil';
import { Box, Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import type { Models } from '@dto/model';

import { PreReserveDataState } from '@recoil/myPortfolio';

interface ModelSearchItemProps {
  data: Models;
  onClick: () => void;
}

function ProductSearchItem({ data, onClick }: ModelSearchItemProps) {
  const setReserveData = useSetRecoilState(PreReserveDataState);
  const handleClickModel = () => {
    onClick();
    setReserveData((props) => ({ ...props, model: data.name }));
  };

  return (
    <li>
      <Flexbox alignment="center" onClick={handleClickModel}>
        <Box customStyle={{ marginLeft: 12 }}>
          <ModelName
            weight="medium"
            variant="h4"
            dangerouslySetInnerHTML={{
              __html: data.modelDeco
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
