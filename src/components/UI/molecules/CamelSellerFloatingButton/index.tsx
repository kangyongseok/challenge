import { useRouter } from 'next/router';
import { Icon, Typography } from '@mrcamelhub/camel-ui';

import OsAlarmDialog from '@components/UI/organisms/OsAlarmDialog';

import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
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
  const router = useRouter();

  const triggered = useReverseScrollTrigger();
  const { handleMoveCamelSeller, openOsAlarmDialog, handleCloseOsAlarmDialog } = useMoveCamelSeller(
    { attributes }
  );

  const { data: { notProcessedLegitCount = 0 } = {} } = useQueryUserInfo();

  return (
    <>
      <Wrapper
        onClick={handleMoveCamelSeller} // handleClick
        isLegitTooltip={!!notProcessedLegitCount && router.pathname === '/'}
        isUserShop={router.pathname === '/user/shop'}
      >
        <FloatingButton triggered={triggered}>
          <Typography variant="h3" weight="medium" color="uiWhite">
            판매하기
          </Typography>
          <Icon name="PlusOutlined" size="medium" color="uiWhite" />
        </FloatingButton>
      </Wrapper>
      <Wrapper
        onClick={handleMoveCamelSeller} // handleClick
        isLegitTooltip={!!notProcessedLegitCount && router.pathname === '/'}
        isUserShop={router.pathname === '/user/shop'}
      >
        <FloatingButton triggered={triggered} onlyIcon>
          <Icon name="PlusOutlined" size="medium" color="uiWhite" />
        </FloatingButton>
      </Wrapper>
      <OsAlarmDialog open={openOsAlarmDialog} onClose={handleCloseOsAlarmDialog} />
    </>
  );
}

export default CamelSellerFloatingButton;
