import { Flexbox, Icon, Image, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { LegitRequestBrandLogo } from '@components/pages/legitRequest/index';

import { IOS_SAFE_AREA_TOP } from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

interface LegitRequestTitleWithModelImageProps {
  brandLogo: string;
  brandName: string;
  categoryName: string;
  title: string;
  modelImage: string;
  isEditMode?: boolean;
}

function LegitRequestTitleWithModelImage({
  brandLogo,
  brandName,
  categoryName,
  title,
  modelImage,
  isEditMode = false
}: LegitRequestTitleWithModelImageProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  return (
    <>
      <LegitRequestBrandLogo src={brandLogo} />
      <Title isEditMode={isEditMode}>
        <Flexbox direction="vertical" gap={4} customStyle={{ flex: 1 }}>
          <Flexbox alignment="center">
            <Typography variant="h4" customStyle={{ color: common.ui60 }}>
              {categoryName}
            </Typography>
            <Icon
              name="CaretRightOutlined"
              width={16}
              height={16}
              customStyle={{ color: common.ui60 }}
            />
            <Typography variant="h4" customStyle={{ color: common.ui60 }}>
              {brandName}
            </Typography>
          </Flexbox>
          <Typography variant="h3" weight="medium">
            {title}
          </Typography>
        </Flexbox>
        <Image
          src={modelImage}
          alt="Model Img"
          width={110}
          height={110}
          round={8}
          disableAspectRatio
          customStyle={{ margin: '0 auto' }}
        />
      </Title>
    </>
  );
}

const Title = styled.section<{ isEditMode?: boolean }>`
  display: flex;
  column-gap: 12px;
  align-items: center;
  padding: calc(52px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'}) 20px
    ${({ isEditMode }) => (isEditMode ? 0 : 32)}px;

  & > div:last-of-type {
    z-index: ${({ theme: { zIndex } }) => zIndex.header};
    margin-top: -14px;
  }
`;

export default LegitRequestTitleWithModelImage;
