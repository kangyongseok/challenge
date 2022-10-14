import { Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Image } from '@components/UI/atoms';

import type { Models } from '@dto/model';

interface ModelSearchItemProps {
  data: Models;
  onClick?: () => void;
}

function CamelSellerProductSearchItem({ data, onClick }: ModelSearchItemProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const handleClickModel = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <li>
      <Flexbox alignment="center" onClick={handleClickModel}>
        <Image
          width={50}
          height={50}
          src={data.imageThumbnail}
          disableAspectRatio
          customStyle={{ borderRadius: 8, marginRight: 12 }}
        />
        <Flexbox direction="vertical">
          <ModelName
            weight="medium"
            variant="h4"
            dangerouslySetInnerHTML={{
              __html: data.modelDeco
            }}
          />
          <Typography weight="medium" variant="small1" customStyle={{ color: common.ui60 }}>
            {data.subParentCategoryName}
          </Typography>
        </Flexbox>
      </Flexbox>
    </li>
  );
}

const ModelName = styled(Typography)`
  & > b {
    color: ${({ theme: { palette } }) => palette.primary.main};
  }
`;
export default CamelSellerProductSearchItem;
