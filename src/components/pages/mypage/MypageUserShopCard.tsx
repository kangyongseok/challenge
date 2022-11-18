import { useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Image } from '@components/UI/atoms';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { CAMEL_SELLER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent, commaNumber, getAppVersion, productionEnvUrl } from '@utils/common';

import type { CamelSellerLocalStorage } from '@typings/camelSeller';
import { dialogState } from '@recoil/common';
import { camelSellerDialogStateFamily } from '@recoil/camelSeller';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

// TODO 추후 UI 라이브러리 업데이트 후 수정 필요
function MypageUserShopCard() {
  const router = useRouter();
  const { data: accessUser } = useQueryAccessUser();
  const setDialogState = useSetRecoilState(dialogState);
  const setOpenAppDown = useSetRecoilState(camelSellerDialogStateFamily('nonMemberAppdown'));
  const setContinueDialog = useSetRecoilState(camelSellerDialogStateFamily('continue'));
  const {
    theme: {
      palette: { primary, common },
      box: { round }
    }
  } = useTheme();

  const {
    data: {
      userProductInfo: { displayedUserProductCount = 0, hasUserProduct = false, images = [] } = {}
    } = {}
  } = useQuery(queryKeys.users.userInfo(), fetchUserInfo);

  const handleClickCamelSeller = () => {
    const prevStep = LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage;

    if (hasUserProduct) {
      logEvent(attrKeys.camelSeller.CLICK_MY_STORE, {
        name: attrProperty.name.MY
      });

      router.push('/user/shop');
    } else {
      logEvent(attrKeys.camelSeller.CLICK_NEWPRODUCT, {
        name: attrProperty.name.MAIN
      });

      if (process.env.NODE_ENV !== 'development') {
        if (!(checkAgent.isIOSApp() || checkAgent.isAndroidApp())) {
          setOpenAppDown(({ type }) => ({
            type,
            open: true
          }));
          return;
        }

        if (checkAgent.isIOSApp() && getAppVersion() < 1143 && productionEnvUrl) {
          setDialogState({
            type: 'appUpdateNotice',
            customStyleTitle: { minWidth: 269 },
            secondButtonAction: () => {
              if (
                window.webkit &&
                window.webkit.messageHandlers &&
                window.webkit.messageHandlers.callExecuteApp
              )
                window.webkit.messageHandlers.callExecuteApp.postMessage(
                  'itms-apps://itunes.apple.com/app/id1541101835'
                );
            }
          });

          return;
        }

        if (checkAgent.isAndroidApp() || checkAgent.isIOSApp()) {
          window.getAuthCamera = (result: boolean) => {
            if (!result) {
              setDialogState({
                type: 'appAuthCheck',
                customStyleTitle: { minWidth: 269, marginTop: 12 },
                firstButtonAction: () => {
                  if (
                    checkAgent.isIOSApp() &&
                    window.webkit &&
                    window.webkit.messageHandlers &&
                    window.webkit.messageHandlers.callMoveToSetting &&
                    window.webkit.messageHandlers.callMoveToSetting.postMessage
                  ) {
                    window.webkit.messageHandlers.callMoveToSetting.postMessage(0);
                  }
                  if (checkAgent.isAndroidApp() && window.webview && window.webview.moveToSetting) {
                    window.webview.moveToSetting();
                  }
                }
              });
            }
          };
        }
      }

      if (accessUser && prevStep?.title) {
        setContinueDialog(({ type }) => ({ type, open: true }));
        return;
      }

      router.push('/camelSeller');
    }
  };

  // if (!roles.length || !roles.some((role) => role === PRODUCT_CREATE)) return null;

  return (
    <StyledMypageUserShopCard onClick={handleClickCamelSeller}>
      <Box customStyle={{ flexGrow: 1 }}>
        <Typography variant="body2" weight="medium" customStyle={{ color: common.ui60 }}>
          {!hasUserProduct ? '카멜에서 첫 거래를 시작해볼까요?' : '내 상점'}
        </Typography>
        <Flexbox gap={4} customStyle={{ marginTop: 4 }}>
          <Typography
            variant="h4"
            weight="bold"
            customStyle={{ '& > strong': { color: primary.main } }}
          >
            {!hasUserProduct ? (
              '판매등록 하기'
            ) : (
              <>
                판매중인 매물&nbsp;<strong>{commaNumber(displayedUserProductCount)}</strong>
              </>
            )}
          </Typography>
        </Flexbox>
      </Box>
      {!hasUserProduct && (
        <ProductCreateButton>
          <Icon name="PlusOutlined" color={primary.main} />
        </ProductCreateButton>
      )}
      {hasUserProduct && images.length > 0 && displayedUserProductCount ? (
        <Box customStyle={{ position: 'relative', width: 56, minWidth: 56, height: 56 }}>
          {images.map((image, index) => (
            <UserProductImage
              key={`user-shop-product-image-${image?.slice(image.lastIndexOf('/') + 1)}`}
              width={`${56 - index * 4}px`}
              height={`${56 - index * 4}px`}
              src={image}
              alt="Shop Product Img"
              disableAspectRatio
              index={index}
              customStyle={{
                borderRadius: round['8']
              }}
            />
          ))}
        </Box>
      ) : (
        ''
      )}
      {hasUserProduct && !displayedUserProductCount && <Icon name="Arrow2RightOutlined" />}
    </StyledMypageUserShopCard>
  );
}

const StyledMypageUserShopCard = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 80px;
  padding: 12px 20px;
  border-radius: ${({ theme: { box } }) => box.round['8']};
  background-color: #eff0f2;
  cursor: pointer;
`;

const ProductCreateButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  min-width: 56px;
  background-color: #dcdde0;
  border-radius: ${({ theme: { box } }) => box.round['8']};
`;

const UserProductImage = styled(Image)<{ index: number }>`
  position: absolute;
  top: ${({ index }) => index * 2}px;
  left: ${({ index }) => index * 8}px;
  z-index: ${({ index }) => 3 - index};
  object-fit: cover;
`;

export default MypageUserShopCard;
