import { useEffect } from 'react';

import { useRecoilValue, useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Button, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  CamelSellerHeader,
  CamelSellerProductSearch,
  CamelSellerSmsDialog
} from '@components/pages/camelSeller';

import LocalStorage from '@library/localStorage';
import ChannelTalk from '@library/channelTalk';
import { logEvent } from '@library/amplitude';

import { CAMEL_SELLER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

import { camelSellerBooleanStateFamily, camelSellerEditState } from '@recoil/camelSeller';

function CamelSeller() {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const focus = useRecoilValue(camelSellerBooleanStateFamily('focus'));
  const resetEditState = useResetRecoilState(camelSellerEditState);

  useEffect(() => {
    logEvent(attrKeys.camelSeller.VIEW_PRODUCT_MODEL, {
      name: attrProperty.name.PRODUCT_MODEL
    });
    resetEditState();
    ChannelTalk.hideChannelButton();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClickUnknownName = () => {
    logEvent(attrKeys.camelSeller.CLICK_MODEL, {
      name: attrProperty.name.PRODUCT_MODEL,
      title: attrProperty.title.DONTKNOW_MODEL
    });

    LocalStorage.set(CAMEL_SELLER, {
      title: '',
      search: false
    });
    router.push('/camelSeller/selectCategory');
  };

  return (
    <GeneralTemplate header={<CamelSellerHeader />}>
      <Typography variant="h3" weight="medium" customStyle={{ color: common.ui60, marginTop: 32 }}>
        판매하고자 하는 모델을 선택해주세요.
      </Typography>
      <CamelSellerProductSearch />
      <UnknownModel
        alignment="center"
        justifyContent="center"
        isFocus={!!(focus.isState && checkAgent.isIOSApp())}
        onClick={handleClickUnknownName}
      >
        <UnknownModelButton variant="contained" data-none-model-name="true">
          모델 이름을 잘 모르겠어요
        </UnknownModelButton>
      </UnknownModel>
      <CamelSellerSmsDialog />
    </GeneralTemplate>
  );
}

const UnknownModel = styled(Flexbox)<{ isFocus: boolean }>`
  position: fixed;
  bottom: ${({ isFocus }) => (isFocus ? 310 : 20)}px;
  left: 0;
  width: 100%;
`;

const UnknownModelButton = styled(Button)`
  background: ${({ theme: { palette } }) => palette.primary.highlight};
  font-size: ${({ theme: { typography } }) => typography.small1.size};
  font-weight: ${({ theme: { typography } }) => typography.small1.weight.medium};
  color: ${({ theme: { palette } }) => palette.primary.main};
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.1);
  border-radius: 36px;
  padding: 6px 10px;
  height: 30px;
`;

export default CamelSeller;
