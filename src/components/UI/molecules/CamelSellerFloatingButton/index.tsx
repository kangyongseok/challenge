import { useEffect, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Icon } from 'mrcamel-ui';

import LocalStorage from '@library/localStorage';
import ChannelTalk from '@library/channelTalk';
import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { CAMEL_SELLER } from '@constants/localStorage';
import { PRODUCT_SELLER } from '@constants/camelSeller';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

import type { CamelSellerLocalStorage } from '@typings/camelSeller';
import { camelSellerDialogStateFamily } from '@recoil/camelSeller';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import { FloatingButton } from './CamelSellerFloatingButton.style';

function CamelSellerFloatingButton() {
  const router = useRouter();
  const { data: accessUser } = useQueryAccessUser();
  const setOpenAppDown = useSetRecoilState(camelSellerDialogStateFamily('nonMemberAppdown'));
  const setOpenCameraSetting = useSetRecoilState(camelSellerDialogStateFamily('cameraAuth'));
  const setContinueDialog = useSetRecoilState(camelSellerDialogStateFamily('continue'));
  const { data: { roles = [] } = {} } = useQuery(queryKeys.users.userInfo(), fetchUserInfo);
  const [authProductSeller, setAuthProductSeller] = useState(false);

  useEffect(() => {
    if (accessUser && roles.includes(PRODUCT_SELLER as never)) {
      setAuthProductSeller(true);
      ChannelTalk.hideChannelButton();
    }
  }, [accessUser, roles]);

  const getAttName = () => {
    if (router.pathname === '/') return attrProperty.name.MAIN;
    if (router.pathname === 'mypage') return attrProperty.name.MY_STORE;
    return '';
  };

  const handleClickMoveToCamelSeller = () => {
    const prevStep = LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage;
    logEvent(attrKeys.camelSeller.CLICK_NEWPRODUCT, {
      name: getAttName()
    });

    if (process.env.NODE_ENV !== 'development') {
      if (!(checkAgent.isAndroidApp() || checkAgent.isIOSApp())) {
        setOpenAppDown(({ type }) => ({
          type,
          open: true
        }));
        return;
      }

      if (checkAgent.isAndroidApp() || checkAgent.isIOSApp()) {
        window.getCameraAuth = (result: boolean) => {
          if (!result) {
            setOpenCameraSetting(({ type }) => ({
              type,
              open: !result
            }));
          }
        };
      }
    }

    if (accessUser && prevStep?.step) {
      setContinueDialog(({ type }) => ({ type, open: true }));
    }
  };

  // eslint-disable-next-line no-constant-condition
  if (authProductSeller && false) {
    return (
      <FloatingButton
        variant="contained"
        brandColor="primary"
        size="large"
        onClick={handleClickMoveToCamelSeller}
      >
        <Icon name="PlusOutlined" />
        판매하기
      </FloatingButton>
    );
  }
  return <Box />;
}

export default CamelSellerFloatingButton;
