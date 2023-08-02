import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Icon } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import OsAlarmDialog from '@components/UI/organisms/OsAlarmDialog';
import { FloatingActionButton } from '@components/UI/molecules';

import attrProperty from '@constants/attrProperty';

import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useMoveCamelSeller from '@hooks/useMoveCamelSeller';

function HomeFloatingActionButton() {
  const router = useRouter();

  const {
    palette: { common }
  } = useTheme();

  const { handleMoveCamelSeller, openOsAlarmDialog, handleCloseOsAlarmDialog } = useMoveCamelSeller(
    {
      attributes: {
        name: attrProperty.name.MAIN,
        title: attrProperty.title.MAIN_FLOATING,
        source: 'MAIN'
      }
    }
  );

  const { data: { notProcessedLegitCount = 0 } = {} } = useQueryUserInfo();

  const handleClick = () => router.push('/legit');

  return (
    <>
      <FloatingActionButton
        iconName="PlusOutlined"
        text="등록하기"
        bottom={notProcessedLegitCount > 0 ? 110 : 80}
        dialMenu={
          <Flexbox
            direction="vertical"
            customStyle={{
              minWidth: 200,
              border: `1px solid ${common.line01}`,
              borderRadius: 12,
              boxShadow: '0px 8px 16px 0px rgba(0, 0, 0, 0.12)',
              backgroundColor: common.bg01
            }}
          >
            <Button
              variant="inline"
              size="xlarge"
              brandColor="black"
              startIcon={<Icon name="BoxFilled" />}
              fullWidth
              onClick={handleMoveCamelSeller}
            >
              판매하기
            </Button>
            <Box
              customStyle={{
                height: 1,
                backgroundColor: common.line01
              }}
            />
            <Button
              variant="inline"
              size="xlarge"
              brandColor="black"
              startIcon={<Icon name="LegitOutlined" />}
              fullWidth
              onClick={handleClick}
            >
              사진감정
            </Button>
          </Flexbox>
        }
      />
      <OsAlarmDialog open={openOsAlarmDialog} onClose={handleCloseOsAlarmDialog} />
    </>
  );
}

export default HomeFloatingActionButton;
