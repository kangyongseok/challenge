import { useEffect, useState } from 'react';

import { useRecoilValue, useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Button, Dialog, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { IconBox } from '@components/UI/molecules/Header/Header.styles';
import { Header } from '@components/UI/molecules';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { CAMEL_SELLER } from '@constants/localStorage';
import { APP_TOP_STATUS_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import {
  camelSellerBooleanStateFamily,
  camelSellerDialogStateFamily,
  camelSellerSubmitState,
  camelSellerTempSaveDataState
} from '@recoil/camelSeller';

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
  const { pathname, query, back, replace, push, beforePopState, asPath } = useRouter();
  const resetSubmitData = useResetRecoilState(camelSellerSubmitState);
  const resetClickState = useResetRecoilState(camelSellerBooleanStateFamily('submitClick'));
  const tempData = useRecoilValue(camelSellerTempSaveDataState);
  const resetTempData = useResetRecoilState(camelSellerTempSaveDataState);
  const [disabledCallForm, setDisabledCallForm] = useState(false);
  const viewRecentPriceList = useRecoilValue(camelSellerDialogStateFamily('recentPrice'));

  const {
    theme: {
      typography,
      palette: { common, primary }
    }
  } = useTheme();
  const [toggleLaterDialog, setToggleLaterDialog] = useState(false);

  useEffect(() => {
    beforePopState(() => {
      if (
        !query.id &&
        !viewRecentPriceList.open &&
        pathname.split('/').includes('registerConfirm')
      ) {
        window.history.pushState(null, '', asPath);
        setToggleLaterDialog(true);
        return false;
      }
      return true;
    });
  }, [asPath, beforePopState, pathname, query.id, viewRecentPriceList.open]);

  useEffect(() => {
    if (toggleLaterDialog) {
      logEvent(attrKeys.camelSeller.VIEW_PRODUCT_POPUP, {
        name: pathname,
        title: attrProperty.title.LATER
      });
    }
  }, [pathname, toggleLaterDialog]);

  const handleClickBack = () => {
    logEvent(attrKeys.camelSeller.CLICK_CLOSE, {
      name: attrProperty.name.PRODUCT
    });
    if (query.id) {
      resetSubmitData();
      resetTempData();
      back();
      return;
    }
    if (pathname.split('/').includes('registerConfirm')) {
      setToggleLaterDialog(true);
    } else {
      back();
    }
  };

  const handleClickLogo = () => {
    logEvent(attrKeys.camelSeller.CLICK_CLOSE, {
      name: attrProperty.name.PRODUCT
    });

    if (query.id) {
      resetSubmitData();
      resetTempData();
      push('/');
      return;
    }
    if (pathname.split('/').includes('registerConfirm')) {
      setToggleLaterDialog(true);
    } else {
      push('/');
    }
  };

  const handlClickLater = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_POPUP, {
      name: pathname,
      title: attrProperty.title.LATER,
      att: 'SAVE'
    });

    if (!query.id) {
      LocalStorage.set(CAMEL_SELLER, {
        ...tempData,
        brand: { id: query.brandIds, name: query.brandName },
        category: { id: query.categoryIds, name: query.categoryName }
      });
      // resetTempData();
      // resetSubmitData();
    }
    resetClickState();
    replace('/');
  };

  const handleClickContinue = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_POPUP, {
      name: pathname,
      title: attrProperty.title.LATER,
      att: 'CONTINUE'
    });

    setToggleLaterDialog(false);
  };

  const handleClickCallForm = () => {
    if (!(disabledCallForm || tempData.description)) {
      setDisabledCallForm(true);
      if (callForm) {
        callForm();
      }
    }
  };

  if (type === 'textarea') {
    return (
      <Header
        customHeader={
          <>
            <Box
              customStyle={{
                height: 56
              }}
            />
            <Wrap alignment="center" customStyle={{ padding: '0 20px' }}>
              <Icon
                onClick={onClickClose}
                name="ArrowLeftOutlined"
                // customStyle={{ display: type === 'isSearch' ? 'none' : 'block' }}
                size="medium"
              />
              <CallFormButton
                variant="contained"
                weight="medium"
                onClick={handleClickCallForm}
                disabled={!!(disabledCallForm || tempData.description)}
              >
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
            <Box
              customStyle={{
                height: 56 + (isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0)
              }}
            />
            <Wrap alignment="center">
              <IconBox show onClick={handleClickBack}>
                <Icon name="CloseOutlined" size="medium" />
              </IconBox>
              <Icon
                name="LogoText_96_20"
                onClick={handleClickLogo}
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
        customStyle={{ width: '100%', paddingTop: 32 }}
      >
        <Box customStyle={{ textAlign: 'center' }}>
          <Typography customStyle={{ color: common.ui20 }} weight="bold" variant="h3">
            등록하던 내용을 임시저장할까요?
          </Typography>
        </Box>
        <Flexbox direction="vertical" gap={8} customStyle={{ marginTop: 32 }}>
          <Button
            fullWidth
            size="large"
            variant="contained"
            brandColor="primary"
            customStyle={{ fontWeight: typography.body1.weight.medium }}
            onClick={handlClickLater}
          >
            임시 저장하기
          </Button>
          <Button
            fullWidth
            size="large"
            variant="outlined"
            customStyle={{
              fontWeight: typography.body1.weight.medium,
              background: primary.highlight,
              color: primary.light
            }}
            onClick={handleClickContinue}
          >
            계속 진행하기
          </Button>
        </Flexbox>
      </Dialog>
    </>
  );
}

const Wrap = styled(Flexbox)`
  width: 100%;
  height: 56px;
  background: ${({ theme: { palette } }) => palette.common.uiWhite};
  position: fixed;
  top: 0;
  left: 0;
  z-index: 11;
  justify-content: space-between;
  padding-top: ${isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT + 10 : 0}px;
`;

const CallFormButton = styled(Button)<{ disabled: boolean }>`
  background: ${({
    theme: {
      palette: { common, primary }
    },
    disabled
  }) => (disabled ? common.ui80 : primary.highlight)};
  color: ${({
    theme: {
      palette: { common, primary }
    },
    disabled
  }) => (disabled ? common.ui60 : primary.light)};
  font-size: ${({ theme }) => theme.typography.small1.size};
  padding: 0 6px;
  height: 30px;
  font-weight: 400;
`;

export default CamelSellerHeader;
