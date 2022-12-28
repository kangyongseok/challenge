import { Image } from 'mrcamel-ui';
import styled from '@emotion/styled';

interface LegitRequestBrandLogoProps {
  src: string;
}

function LegitRequestBrandLogo({ src }: LegitRequestBrandLogoProps) {
  return (
    <BrandLogo>
      <Image
        src={src}
        alt="Brand Logo Img"
        width={80}
        height={80}
        disableAspectRatio
        customStyle={{ margin: '0 auto', mixBlendMode: 'screen' }}
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
