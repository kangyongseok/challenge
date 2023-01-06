import { useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Button, Dialog, Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { postWithdraw } from '@api/userAuth';

import queryKeys from '@constants/queryKeys';
import { ONBOARDING_SKIP_USERIDS } from '@constants/localStorage';
import attrKeys from '@constants/attrKeys';

import { accessUserSettingValuesState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface ExitProps {
  status: boolean;
  setExtToggle: (close: boolean) => void;
}

function ExitDialog({ status, setExtToggle }: ExitProps) {
  const router = useRouter();
  const { data: accessUser } = useQueryAccessUser();
  const setAccessUserSettingValuesState = useSetRecoilState(accessUserSettingValuesState);

  const { refetch } = useQuery(queryKeys.userAuth.withdraw(), postWithdraw, {
    enabled: false,
    onSuccess: async () => {
      const { userId = 0 } = accessUser || {};

      setAccessUserSettingValuesState((prevState) =>
        prevState.filter(({ userId: prevUserId }) => prevUserId !== userId)
      );
      setExtToggle(false);
      router.push('/logout');
    }
  });

  const clearSkipUserId = () => {
    const userIds = (LocalStorage.get(ONBOARDING_SKIP_USERIDS) as number[]) || [];
    const result = userIds.filter((id) => Number(id) !== Number(accessUser?.userId));
    LocalStorage.set(ONBOARDING_SKIP_USERIDS, result);
  };

  const handleWithdraw = () => {
    logEvent(attrKeys.mypage.SELECT_WITHDRAW, {
      att: 'YES'
    });
    clearSkipUserId();
    refetch();
  };

  const handleMaintainWithdraw = () => {
    logEvent(attrKeys.mypage.SELECT_WITHDRAW, {
      att: 'NO'
    });

    setExtToggle(false);
  };

  return (
    <Dialog open={status} onClose={() => setExtToggle(false)}>
      <Typography weight="medium" customStyle={{ textAlign: 'center' }}>
        지금까지 쌓아놓은 검색 이력과 찜 리스트,
      </Typography>
      <Typography weight="medium" customStyle={{ textAlign: 'center' }}>
        맞춤 추천을 위한 정보가 모두 삭제됩니다.
      </Typography>
      <Typography weight="medium" customStyle={{ textAlign: 'center' }}>
        그래도 회원탈퇴 하시겠어요?
      </Typography>
      <ButtonArea alignment="center" gap={10}>
        <Button
          fullWidth
          variant="ghost"
          brandColor="primary"
          customStyle={{ width: 128 }}
          onClick={handleWithdraw}
        >
          회원탈퇴
        </Button>
        <Button
          fullWidth
          variant="solid"
          brandColor="primary"
          customStyle={{ width: 128 }}
          onClick={handleMaintainWithdraw}
        >
          회원정보 유지
        </Button>
      </ButtonArea>
    </Dialog>
  );
}

const ButtonArea = styled(Flexbox)`
  margin-top: 30px;
`;

export default ExitDialog;
