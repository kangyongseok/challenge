import { Image } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { IOS_SAFE_AREA_TOP } from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

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
        round={8}
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
    margin-top: calc(-28px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'});
  }
`;

export default LegitRequestBrandLogo;
