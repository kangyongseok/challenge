import styled from '@emotion/styled';

import { Image } from '@components/UI/atoms';

interface LegitRequestBrandLogoProps {
  src: string;
}

function LegitRequestBrandLogo({ src }: LegitRequestBrandLogoProps) {
  return (
    <BrandLogo>
      <Image
        src={src}
        width={80}
        height={80}
        disableAspectRatio
        customStyle={{ margin: '0 auto' }}
      />
    </BrandLogo>
  );
}

const BrandLogo = styled.section`
  display: flex;
  justify-content: center;
  position: relative;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  user-select: none;

  & > div {
    position: absolute;
    margin-top: -28px;
  }
`;

export default LegitRequestBrandLogo;
