import type { MouseEvent } from 'react';

import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

function PhotoIconBox({
  onClick,
  count,
  totalImageCount
}: {
  count: number;
  totalImageCount: number;
  onClick: (e: MouseEvent<HTMLDivElement>) => void;
}) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  return (
    <PhotoBox onClick={onClick} data-id={0}>
      <Icon name="CameraFilled" customStyle={{ color: common.ui80 }} />
      <Flexbox customStyle={{ marginTop: 8 }} gap={3}>
        <Typography weight="bold" variant="small2" customStyle={{ color: common.ui20 }}>
          {count}
        </Typography>
        <Typography customStyle={{ color: common.ui60 }} weight="bold" variant="small2">
          /
        </Typography>
        <Typography customStyle={{ color: common.ui60 }} weight="bold" variant="small2">
          {totalImageCount}
        </Typography>
      </Flexbox>
    </PhotoBox>
  );
}

const PhotoBox = styled.div`
  min-width: 72px;
  height: 72px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default PhotoIconBox;
