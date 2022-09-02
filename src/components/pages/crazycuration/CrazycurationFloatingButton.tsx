import { memo, useCallback } from 'react';

import { useRouter } from 'next/router';
import { Icon, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useContentsProducts from '@hooks/useContentsProducts';

const colorData = {
  a: {
    color: '#000000',
    backgroundColor: '#ACFF25'
  },
  b: {
    color: '#FFFFFF',
    backgroundColor: '#507C44'
  }
};

interface CrazycurationFloatingButtonProps {
  contentsId: number;
  listType: 'a' | 'b';
}

function CrazycurationFloatingButton({ contentsId, listType }: CrazycurationFloatingButtonProps) {
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
      backgroundColor={colorData[listType].backgroundColor}
      onClick={handleClick}
    >
      <Icon name="HeartFilled" color={colorData[listType].color} />
      <Typography variant="h4" weight="bold" customStyle={{ color: colorData[listType].color }}>
        담은 매물
      </Typography>
      <NumberBadge
        color={colorData[listType].backgroundColor}
        backgroundColor={colorData[listType].color}
      >
        <Typography
          variant="body1"
          weight="bold"
          customStyle={{ color: colorData[listType].backgroundColor }}
        >
          {wishTotalCount}
        </Typography>
      </NumberBadge>
    </Wrapper>
  ) : null;
}

const Wrapper = styled.div<{ show: boolean; backgroundColor: string }>`
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
  background-color: ${({ backgroundColor }) => backgroundColor};
  visibility: ${({ show }) => (show ? 'visible' : 'hidden')};
  transition: visibility 0.1s ease-in;
  z-index: 3;
  cursor: pointer;
`;

const NumberBadge = styled.div<{ color: string; backgroundColor: string }>`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  top: -5px;
  right: -4px;
  border: 2px solid ${({ color }) => color};
  background-color: ${({ backgroundColor }) => backgroundColor};
`;

export default memo(CrazycurationFloatingButton);
