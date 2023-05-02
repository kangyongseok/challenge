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
      <Icon name="CameraFilled" width={32} height={32} color={common.ui80} />
      <Flexbox customStyle={{ marginTop: 8 }} gap={3}>
        <Typography variant="body2" weight="medium">
          {count}
        </Typography>
        <Typography variant="body2" weight="medium" color="ui80">
          /
        </Typography>
        <Typography variant="body2" weight="medium" color="ui80">
          {totalImageCount}
        </Typography>
      </Flexbox>
    </PhotoBox>
  );
}

const PhotoBox = styled.div`
  min-width: 84px;
  height: 84px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg02};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default PhotoIconBox;
