import { memo, useCallback } from 'react';

import { useRouter } from 'next/router';
import { Icon, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useContentsProducts from '@hooks/useContentsProducts';

interface CrazycurationFloatingButtonProps {
  contentsId: number;
  buttonStyle: {
    color: string;
    backgroundColor: string;
    badgeColor?: string;
    badgeBackgroundColor?: string;
    borderColor?: string;
    boxShadow?: string;
  };
}

function CrazycurationFloatingButton({
  contentsId,
  buttonStyle: { color, backgroundColor, badgeColor, badgeBackgroundColor, borderColor, boxShadow }
}: CrazycurationFloatingButtonProps) {
  const router = useRouter();
  const {
    isFetched,
    data: { wishTotalCount }
  } = useContentsProducts(contentsId);

  const handleClick = useCallback(() => {
    logEvent(attrKeys.crazycuration.clickWishList, {
      name: attrProperty.name.crazyWeek,
      att: wishTotalCount
    });
    router.push('/wishes');
  }, [router, wishTotalCount]);

  return isFetched ? (
    <Wrapper
      show={wishTotalCount > 0}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      boxShadow={boxShadow}
      onClick={handleClick}
    >
      <Icon name="HeartFilled" color={color} />
      <Typography variant="h4" weight="bold" customStyle={{ color }}>
        담은 매물
      </Typography>
      <NumberBadge
        color={backgroundColor}
        backgroundColor={badgeBackgroundColor || color}
        borderColor={borderColor}
      >
        <Typography
          variant="body1"
          weight="bold"
          customStyle={{ color: badgeColor || backgroundColor }}
        >
          {wishTotalCount}
        </Typography>
      </NumberBadge>
    </Wrapper>
  ) : null;
}

const Wrapper = styled.div<{
  show: boolean;
  backgroundColor: string;
  borderColor?: string;
  boxShadow?: string;
}>`
  white-space: nowrap;
  width: 118px;
  height: 52px;
  position: fixed;
  right: 16px;
  bottom: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 50px;
  padding: 16px 20px 16px 16px;
  border: ${({ borderColor }) => borderColor && `2px solid ${borderColor}`};
  background-color: ${({ backgroundColor }) => backgroundColor};
  visibility: ${({ show }) => (show ? 'visible' : 'hidden')};
  opacity: ${({ show }) => Number(show)};
  transition: opacity 0.1s ease-in;
  z-index: 3;
  cursor: pointer;
  box-shadow: ${({ boxShadow }) => boxShadow};
`;

const NumberBadge = styled.div<{ color: string; backgroundColor: string; borderColor?: string }>`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  top: -5px;
  right: -4px;
  border: 2px solid ${({ color, borderColor }) => borderColor || color};
  background-color: ${({ backgroundColor }) => backgroundColor};
`;

export default memo(CrazycurationFloatingButton);
