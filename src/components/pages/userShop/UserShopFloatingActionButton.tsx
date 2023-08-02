import OsAlarmDialog from '@components/UI/organisms/OsAlarmDialog';
import { FloatingActionButton } from '@components/UI/molecules';

import attrProperty from '@constants/attrProperty';

import useMoveCamelSeller from '@hooks/useMoveCamelSeller';

function UserShopFloatingActionButton() {
  const { handleMoveCamelSeller, openOsAlarmDialog, handleCloseOsAlarmDialog } = useMoveCamelSeller(
    {
      attributes: {
        name: attrProperty.name.MY_STORE,
        title: attrProperty.title.MY_STORE_FLOATING,
        source: 'SHOP'
      }
    }
  );

  return (
    <>
      <FloatingActionButton
        iconName="BoxAddOutlined"
        text="판매하기"
        bottom={20}
        onClick={handleMoveCamelSeller}
      />
      <OsAlarmDialog open={openOsAlarmDialog} onClose={handleCloseOsAlarmDialog} />
    </>
  );
}

export default UserShopFloatingActionButton;
