import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Image } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { PRODUCT_SELLER } from '@constants/camelSeller';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/common';

// TODO 추후 UI 라이브러리 업데이트 후 수정 필요
function MypageUserShopCard() {
  const router = useRouter();
  const {
    theme: {
      palette: { primary, common },
      box: { round }
    }
  } = useTheme();

  const {
    data: {
      userProductInfo: { displayedUserProductCount = 0, hasUserProduct = false, images = [] } = {},
      roles = []
    } = {}
  } = useQuery(queryKeys.users.userInfo(), fetchUserInfo);

  const handleClickCamelSeller = () => {
    if (hasUserProduct) {
      logEvent(attrKeys.camelSeller.CLICK_MY_STORE, {
        name: attrProperty.name.MY
      });

      router.push('/user/shop');
    } else {
      logEvent(attrKeys.camelSeller.CLICK_NEWPRODUCT, {
        name: attrProperty.name.MAIN
      });

      router.push('/camelSeller');
    }
  };

  if (!roles.length || !roles.some((role) => role === PRODUCT_SELLER)) return null;

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
      {hasUserProduct && images.length > 0 && (
        <Box customStyle={{ position: 'relative', width: 56, minWidth: 56, height: 56 }}>
          {images.map((image, index) => (
            <UserProductImage
              key={`user-shop-product-image-${image.slice(image.lastIndexOf('/') + 1)}`}
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
      )}
      {hasUserProduct && !images.length && <Icon name="Arrow2RightOutlined" />}
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
`;

export default MypageUserShopCard;
