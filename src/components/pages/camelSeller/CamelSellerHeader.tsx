import { useEffect, useState } from 'react';

import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Button, Dialog, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { IconBox } from '@components/UI/molecules/Header/Header.styles';
import { Header } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { showAppDownloadBannerState } from '@recoil/common';
import { camelSellerEditState, camelSellerSubmitState } from '@recoil/camelSeller';

function CamelSellerHeader({
  type,
  callForm,
  onClickClose
}: {
  type?: string;
  callForm?: () => void;
  backEvent?: () => void;
  onClickClose?: () => void;
}) {
  const router = useRouter();
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const resetSubmitData = useResetRecoilState(camelSellerSubmitState);
  const setEditData = useSetRecoilState(camelSellerEditState);
  const setSubmitData = useSetRecoilState(camelSellerSubmitState);

  const {
    theme: { typography, palette }
  } = useTheme();
  const [toggleLaterDialog, setToggleLaterDialog] = useState(false);

  useEffect(() => {
    if (toggleLaterDialog) {
      logEvent(attrKeys.camelSeller.VIEW_PRODUCT_POPUP, {
        name: router.pathname,
        title: attrProperty.title.LATER
      });
    }
  }, [router.pathname, toggleLaterDialog]);

  const handleClickBack = () => {
    logEvent(attrKeys.camelSeller.CLICK_CLOSE, {
      name: attrProperty.name.PRODUCT
    });
    if (router.query.id) {
      // LocalStorage.remove(CAMEL_SELLER);
      setEditData(null);
      setSubmitData(null);
      router.back();
      return;
    }

    setToggleLaterDialog(true);
  };

  const handlClickLater = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_POPUP, {
      name: router.pathname,
      title: attrProperty.title.LATER,
      att: 'SAVE'
    });
    resetSubmitData();
    router.replace('/');
  };

  const handleClickContinue = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_POPUP, {
      name: router.pathname,
      title: attrProperty.title.LATER,
      att: 'CONTINUE'
    });

    setToggleLaterDialog(false);
  };

  if (type === 'textarea') {
    return (
      <Header
        customHeader={
          <>
            <Box customStyle={{ height: 56 }} />
            <Wrap
              alignment="center"
              showAppDownloadBanner={showAppDownloadBanner}
              customStyle={{ padding: '0 20px' }}
            >
              <Icon
                onClick={onClickClose}
                name="ArrowLeftOutlined"
                // customStyle={{ display: type === 'isSearch' ? 'none' : 'block' }}
                size="medium"
              />
              <CallFormButton variant="contained" onClick={callForm}>
                판매 양식 불러오기
              </CallFormButton>
            </Wrap>
          </>
        }
      />
    );
  }

  return (
    <>
      <Header
        customHeader={
          <>
            <Box customStyle={{ height: 56 }} />
            <Wrap alignment="center" showAppDownloadBanner={showAppDownloadBanner}>
              <IconBox show onClick={handleClickBack}>
                <Icon name="CloseOutlined" size="medium" />
              </IconBox>
              <Icon
                name="LogoText_96_20"
                onClick={() => router.push('/')}
                customStyle={{ marginLeft: -50 }}
              />
              <Box />
            </Wrap>
          </>
        }
      />
      <Dialog
        open={toggleLaterDialog}
        onClose={() => setToggleLaterDialog(false)}
        customStyle={{ width: '100%' }}
      >
        <Box customStyle={{ textAlign: 'center' }}>
          <Typography customStyle={{ color: palette.common.ui20 }} weight="medium">
            등록하던 물건을 임시저장하고
          </Typography>
          <Typography customStyle={{ color: palette.common.ui20 }} weight="medium">
            나중에 다시 진행할까요?
          </Typography>
        </Box>
        <Flexbox direction="vertical" gap={8} customStyle={{ marginTop: 16 }}>
          <Button
            fullWidth
            size="large"
            variant="contained"
            brandColor="primary"
            customStyle={{ fontWeight: typography.body1.weight.bold }}
            onClick={handlClickLater}
          >
            임시 저장하기
          </Button>
          <Button
            fullWidth
            size="large"
            variant="outlined"
            brandColor="primary"
            customStyle={{ fontWeight: typography.body1.weight.medium }}
            onClick={handleClickContinue}
          >
            계속 진행하기
          </Button>
        </Flexbox>
      </Dialog>
    </>
  );
}

const Wrap = styled(Flexbox)<{ showAppDownloadBanner: boolean }>`
  width: 100%;
  height: 56px;
  background: ${({ theme: { palette } }) => palette.common.uiWhite};
  position: fixed;
  top: ${({ showAppDownloadBanner }) => (showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0)}px;
  left: 0;
  z-index: 11;
  justify-content: space-between;
`;

const CallFormButton = styled(Button)`
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui95};
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui20};
  font-size: ${({ theme }) => theme.typography.small1.size};
  padding: 0 6px;
  height: 30px;
  font-weight: 400;
`;

export default CamelSellerHeader;
