import { useRecoilState, useSetRecoilState } from 'recoil';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Dialog, Flexbox, Typography } from '@mrcamelhub/camel-ui';

import { fetchAlarm, putAlarm } from '@api/user';

import queryKeys from '@constants/queryKeys';

import {
  keywordAlertManageBottomSheetState,
  keywordAlertOffDialogOpenState
} from '@recoil/keywordAlert';

function KeywordAlertOffDialog() {
  const [open, setOpenState] = useRecoilState(keywordAlertOffDialogOpenState);
  const setKeywordAlertManageBottomSheetState = useSetRecoilState(
    keywordAlertManageBottomSheetState
  );

  const { refetch } = useQuery(queryKeys.users.alarms(), fetchAlarm, {
    refetchOnMount: true
  });

  const { mutate, isLoading } = useMutation(putAlarm);

  const handleClick = () =>
    mutate(
      {
        isNotiKeyword: true
      },
      {
        async onSuccess() {
          await refetch();
          setOpenState(false);
          setKeywordAlertManageBottomSheetState((prevState) => ({
            ...prevState,
            open: true
          }));
        }
      }
    );

  return (
    <Dialog
      open={open}
      onClose={() => setOpenState(false)}
      fullWidth
      customStyle={{
        paddingTop: 32,
        maxWidth: 311
      }}
    >
      <Flexbox
        alignment="center"
        justifyContent="center"
        customStyle={{
          maxWidth: 52,
          maxHeight: 52,
          fontSize: 52,
          margin: 'auto'
        }}
      >
        🫢
      </Flexbox>
      <Typography
        variant="h3"
        weight="bold"
        textAlign="center"
        customStyle={{
          marginTop: 32
        }}
      >
        키워드 알림이 꺼져있어요!
      </Typography>
      <Typography
        variant="h4"
        textAlign="center"
        customStyle={{
          marginTop: 8
        }}
      >
        알림을 켜고 다시 설정해주세요.
      </Typography>
      <Button
        variant="solid"
        brandColor="black"
        size="large"
        fullWidth
        onClick={handleClick}
        disabled={isLoading}
        customStyle={{
          marginTop: 32
        }}
      >
        키워드 알림 켜기
      </Button>
    </Dialog>
  );
}

export default KeywordAlertOffDialog;
