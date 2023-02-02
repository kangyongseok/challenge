import { Typography } from 'mrcamel-ui';

import { Header } from '@components/UI/molecules';

interface CamelSellerSelectBrandHeaderProps {
  triggered: boolean;
}

function CamelSellerSelectBrandHeader({ triggered }: CamelSellerSelectBrandHeaderProps) {
  return (
    <Header showRight={false} hideTitle={!triggered} isFixed>
      <Typography variant="h3" weight="bold">
        브랜드 선택
      </Typography>
    </Header>
  );
}

export default CamelSellerSelectBrandHeader;
