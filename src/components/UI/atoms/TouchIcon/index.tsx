import type { MouseEvent } from 'react';

import type { IconProps } from '@mrcamelhub/camel-ui/dist/src/components/Icon';
import type { CustomStyle, IconName } from '@mrcamelhub/camel-ui';
import { Icon } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

interface TouchIcon extends IconProps {
  name: IconName;
  wrapCustomStyle?: CustomStyle;
  customStyle?: CustomStyle;
  direction?: 'right' | 'left';
  onClick: (e: MouseEvent) => void;
  size?: 'large' | 'medium' | 'small';
}

function TouchIcon({
  name,
  wrapCustomStyle,
  direction,
  onClick,
  customStyle,
  size,
  color
}: TouchIcon) {
  return (
    <TouchArea css={wrapCustomStyle} direction={direction} onClick={onClick}>
      <Icon name={name} customStyle={customStyle} size={size} color={color} />
    </TouchArea>
  );
}

const TouchArea = styled.div<{ direction: 'right' | 'left' | undefined }>`
  padding: 6px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  ${({ direction }): CSSObject => {
    if (direction === 'right') {
      return {
        marginRight: -6,
        marginLeft: 'auto',
        justifyContent: 'flex-end'
      };
    }
    if (direction === 'left') {
      return {
        marginLeft: -6,
        justifyContent: 'flex-start'
      };
    }
    return {};
  }};
`;

export default TouchIcon;
