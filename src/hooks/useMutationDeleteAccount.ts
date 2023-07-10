import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';

import { postWithdraw } from '@api/userAuth';

import { checkAgent } from '@utils/common';

import { accessUserSettingValuesState } from '@recoil/common';
import useSession from '@hooks/useSession';

function useMutationDeleteAccount() {
  const router = useRouter();

  const setAccessUserSettingValuesState = useSetRecoilState(accessUserSettingValuesState);

  const { isLoggedIn, data: accessUser } = useSession();

  const useMutationResult = useMutation(postWithdraw, {
    onSuccess() {
      if (isLoggedIn && accessUser) {
        if (checkAgent.isAndroidApp()) window.webview?.callSetLogoutUser?.(accessUser.userId);

        if (checkAgent.isIOSApp())
          window.webkit?.messageHandlers?.callSetLogoutUser?.postMessage?.(`${accessUser.userId}`);

        setAccessUserSettingValuesState((prevState) =>
          prevState.filter(({ userId }) => userId !== accessUser.userId)
        );
      }

      router.push('/logout');
    }
  });

  return useMutationResult;
}

export default useMutationDeleteAccount;