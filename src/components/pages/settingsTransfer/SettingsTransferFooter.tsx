import { useState } from 'react';

import { useRecoilValue, useResetRecoilState } from 'recoil';
import { Box, Button, Toast } from 'mrcamel-ui';
import { useMutation, useQuery } from '@tanstack/react-query';

import { logEvent } from '@library/amplitude';

import { fetchTransfers, postTransfers } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  settingsTransferDataState,
  settingsTransferPlatformsState
} from '@recoil/settingsTransfer';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function SettingsTransferFooter() {
  const [open, setOpen] = useState(false);
  const [openDupToast, setOpenDupToast] = useState(false);
  const [openLimitToast, setOpenLimitToast] = useState(false);

  const { siteId, url } = useRecoilValue(settingsTransferDataState);
  const platforms = useRecoilValue(settingsTransferPlatformsState);
  const resetPlatformsState = useResetRecoilState(settingsTransferPlatformsState);
  const resetDataState = useResetRecoilState(settingsTransferDataState);

  const { data: accessUser } = useQueryAccessUser();

  const { data: { userTransfers = [] } = {}, refetch } = useQuery(
    queryKeys.users.transfers(),
    () => fetchTransfers(),
    {
      refetchOnMount: true,
      enabled: !!accessUser
    }
  );

  const { mutate } = useMutation(postTransfers, {
    onSuccess: async () => {
      await refetch();
      resetPlatformsState();
      resetDataState();
      setOpen(true);
      setOpenDupToast(false);
      setOpenLimitToast(false);
    }
  });

  const handleClick = () => {
    logEvent(attrKeys.mypage.CLICK_TRANSFER_MANAGE, {
      name: attrProperty.name.TRANSFER_MANAGE,
      site: (platforms.find(({ selected }) => selected) || {}).name || '',
      url
    });

    if (userTransfers.length >= 3) {
      setOpenLimitToast(true);
      setOpenDupToast(false);
      setOpen(false);
      return;
    }
    if (userTransfers.find(({ url: userTransferUrl }) => url === userTransferUrl)) {
      setOpenDupToast(true);
      setOpen(false);
      setOpenLimitToast(false);
      return;
    }

    mutate({
      siteId,
      url
    });
  };

  return (
    <>
      <Box
        customStyle={{
          width: '100%',
          minHeight: 92
        }}
      >
        <Box
          customStyle={{
            position: 'fixed',
            left: 0,
            bottom: 0,
            width: '100%',
            padding: 20,
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 100%)'
          }}
        >
          <Button
            variant="solid"
            brandColor="primary"
            size="xlarge"
            fullWidth
            onClick={handleClick}
            disabled={!siteId || !url || !accessUser}
          >
            신청하기
          </Button>
        </Box>
      </Box>
      <Toast open={open} onClose={() => setOpen(false)}>
        연동신청이 완료되었습니다!
        <br />
        반영될 때 까지 최대 24시간이 소요됩니다.
      </Toast>
      <Toast open={openDupToast} onClose={() => setOpenDupToast(false)}>
        중복입니다!
      </Toast>
      <Toast open={openLimitToast} onClose={() => setOpenLimitToast(false)}>
        최대 3개까지 연동됩니다!
      </Toast>
    </>
  );
}

export default SettingsTransferFooter;
