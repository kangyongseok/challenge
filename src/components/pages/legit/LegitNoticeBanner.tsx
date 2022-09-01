import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import { useMutation } from 'react-query';
import { Box, CtaButton, Dialog, Flexbox, Icon, Toast, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';

import LocalStorage from '@library/localStorage';

import { postManage } from '@api/userHistory';

import {
  CHECK_LEGIT_STOP_NOTICE_DIALOG_FIRST_OPEN,
  LEGIT_STOP_NOTICE_BANNER_LAST_CLOSE_DATE
} from '@constants/localStorage';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function LegitNoticeBanner() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [open, setOpen] = useState(false);
  const [openToast, setOpenToast] = useState(false);
  const [render, setRender] = useState(false);

  const { data: accessUser } = useQueryAccessUser();

  const { mutate } = useMutation(postManage);

  const handleClose = (e: MouseEvent<HTMLOrSVGElement>) => {
    e.stopPropagation();

    LocalStorage.set(LEGIT_STOP_NOTICE_BANNER_LAST_CLOSE_DATE, dayjs().format('YYYY-MM-DD'));
    setOpen(false);
    setRender(false);
  };

  const handleClick = () => {
    if (!accessUser) return;

    mutate(
      {
        userId: accessUser.userId,
        event: 'SUBMIT_LEGIT_REOPEN'
      },
      {
        onSuccess: () => {
          setOpen(false);
          setOpenToast(true);
        }
      }
    );
  };

  useEffect(() => {
    const checkDialogFirstOpen = LocalStorage.get<boolean>(
      CHECK_LEGIT_STOP_NOTICE_DIALOG_FIRST_OPEN
    );

    if (!checkDialogFirstOpen && render) {
      LocalStorage.set(CHECK_LEGIT_STOP_NOTICE_DIALOG_FIRST_OPEN, true);
      setOpen(true);
    }
  }, [render]);

  useEffect(() => {
    const lastCloseDate = LocalStorage.get<string>(LEGIT_STOP_NOTICE_BANNER_LAST_CLOSE_DATE);

    if (lastCloseDate && !dayjs(lastCloseDate).isSame(dayjs().format('YYYY-MM-DD'))) {
      setRender(true);
    } else if (!lastCloseDate) {
      setRender(true);
    }
  }, []);

  if (render) {
    return (
      <>
        <Flexbox
          gap={8}
          alignment="center"
          onClick={() => setOpen(true)}
          customStyle={{ margin: '0 -20px', padding: '15px 20px', backgroundColor: common.black }}
        >
          <Typography
            variant="body2"
            weight="medium"
            brandColor="red"
            customStyle={{ whiteSpace: 'nowrap' }}
          >
            알림
          </Typography>
          <Typography
            variant="body2"
            weight="medium"
            customStyle={{ flexGrow: 1, color: common.white }}
          >
            사진감정이 더 나은 서비스를 위해 잠시 중단됩니다.
          </Typography>
          <Icon
            width={18}
            height={18}
            name="CloseOutlined"
            color={common.white}
            onClick={handleClose}
          />
        </Flexbox>
        <Dialog open={open} onClose={() => setOpen(false)} customStyle={{ minWidth: 311 }}>
          <Box customStyle={{ textAlign: 'center', fontSize: 52 }}>🕵️‍♀️</Box>
          <Typography
            variant="h3"
            weight="bold"
            customStyle={{ marginTop: 20, textAlign: 'center' }}
          >
            사진감정 일시중단 안내
          </Typography>
          {accessUser ? (
            <Typography customStyle={{ marginTop: 8, textAlign: 'center' }}>
              카멜의 실시간 사진감정이
              <br /> 더 나은 서비스를 위해 잠시 정비 중입니다.
              <br />
              <br />
              재오픈에 맞춰 알려드릴게요! (9월 중)
            </Typography>
          ) : (
            <Typography customStyle={{ marginTop: 8, textAlign: 'center' }}>
              카멜의 실시간 사진감정이
              <br />더 나은 서비스를 위해 잠시 정비 중입니다.
            </Typography>
          )}
          {accessUser ? (
            <CtaButton
              variant="contained"
              brandColor="primary"
              size="large"
              fullWidth
              startIcon={<Icon name="NotiFilled" />}
              onClick={handleClick}
              customStyle={{ marginTop: 32 }}
            >
              오픈 알림받기
            </CtaButton>
          ) : (
            <CtaButton
              variant="contained"
              brandColor="primary"
              size="large"
              fullWidth
              onClick={() => setOpen(false)}
              customStyle={{ marginTop: 32 }}
            >
              확인
            </CtaButton>
          )}
        </Dialog>
        <Toast open={openToast} onClose={() => setOpenToast(false)}>
          <Typography weight="medium" customStyle={{ color: common.white }}>
            사진감정 알림신청이 완료되었습니다!
          </Typography>
        </Toast>
      </>
    );
  }

  return null;
}

export default LegitNoticeBanner;
