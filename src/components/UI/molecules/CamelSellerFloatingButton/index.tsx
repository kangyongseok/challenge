import { useRouter } from 'next/router';
import { Icon, Typography, useTheme } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';

import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';
import useMoveCamelSeller from '@hooks/useMoveCamelSeller';

import { FloatingButton, Wrapper } from './CamelSellerFloatingButton.style';

interface CamelSellerFloatingButtonProps {
  attributes: {
    name: string;
    title: string;
    source: string;
  };
}

function CamelSellerFloatingButton({ attributes }: CamelSellerFloatingButtonProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();

  const triggered = useReverseScrollTrigger();
  const handleClick = useMoveCamelSeller({ attributes });

  const { data: { notProcessedLegitCount = 0 } = {} } = useQuery(
    queryKeys.users.userInfo(),
    fetchUserInfo
  );

  return (
    <>
      <Wrapper
        onClick={handleClick}
        isLegitTooltip={!!notProcessedLegitCount && router.pathname === '/'}
        isUserShop={router.pathname === '/user/shop'}
      >
        <FloatingButton triggered={triggered}>
          <Typography variant="h3" weight="medium" customStyle={{ color: common.uiWhite }}>
            판매하기
          </Typography>
          <Icon name="PlusOutlined" size="medium" color={common.uiWhite} />
        </FloatingButton>
      </Wrapper>
      <Wrapper
        onClick={handleClick}
        isLegitTooltip={!!notProcessedLegitCount && router.pathname === '/'}
        isUserShop={router.pathname === '/user/shop'}
      >
        <FloatingButton triggered={triggered} onlyIcon>
          <Icon name="PlusOutlined" size="medium" color={common.uiWhite} />
        </FloatingButton>
      </Wrapper>
    </>
  );
}

export default CamelSellerFloatingButton;
