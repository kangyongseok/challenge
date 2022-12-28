import type { Dispatch, SetStateAction } from 'react';

import { BottomSheet, Button, Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import type { PostAppointmentData } from '@dto/channel';

interface AppointmentSelectNotiTimeBottomSheetProps {
  open: boolean;
  onClose: () => void;
  setParams: Dispatch<SetStateAction<PostAppointmentData>>;
}

function AppointmentSelectNotiTimeBottomSheet({
  open,
  onClose,
  setParams
}: AppointmentSelectNotiTimeBottomSheetProps) {
  const handleClick = (notiTime: number) => () => {
    setParams((prevState) => ({ ...prevState, notiTime }));
    onClose();
  };

  return (
    <BottomSheet disableSwipeable open={open} onClose={onClose}>
      <Flexbox direction="vertical" gap={20} customStyle={{ padding: 20 }}>
        <Flexbox direction="vertical">
          <Menu variant="h3" weight="medium" onClick={handleClick(0)}>
            알림 없음
          </Menu>
          <Menu variant="h3" weight="medium" onClick={handleClick(15)}>
            15분 전 알림
          </Menu>
          <Menu variant="h3" weight="medium" onClick={handleClick(30)}>
            30분 전 알림
          </Menu>
          <Menu variant="h3" weight="medium" onClick={handleClick(45)}>
            45분 전 알림
          </Menu>
          <Menu variant="h3" weight="medium" onClick={handleClick(60)}>
            1시간 전 알림
          </Menu>
        </Flexbox>
        <Button size="xlarge" variant="ghost" brandColor="black" fullWidth onClick={onClose}>
          취소
        </Button>
      </Flexbox>
    </BottomSheet>
  );
}

const Menu = styled(Typography)`
  padding: 12px;
  text-align: center;
  cursor: pointer;
`;

export default AppointmentSelectNotiTimeBottomSheet;
