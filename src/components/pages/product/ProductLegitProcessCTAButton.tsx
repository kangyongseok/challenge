import { useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { CtaButton, Flexbox, Tooltip, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import ChannelTalk from '@library/channelTalk';
import { logEvent } from '@library/amplitude';

import { fetchProductLegit } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { firstUserAnimationState } from '@recoil/productLegitProcess';

function ProductLegitProcessCTAButton() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();
  const isAnimation = useRecoilValue(firstUserAnimationState);
  const productId = Number(router.query.id);
  const { data } = useQuery(
    queryKeys.products.productLegit({ productId }),
    () => fetchProductLegit(productId),
    {
      enabled: !!router.query.id
    }
  );

  const isButton = () => {
    if (router.query.id && router.query.firstLegit === 'true' && isAnimation) {
      return true;
    }
    return !!(router.query.id && !router.query.firstLegit);
  };

  const getLegitStatusName = () => {
    switch (data?.status) {
      case 1:
        return 'REQUESTED';
      case 10:
        return 'PRE_CONFIRM';
      case 11:
        return 'PRE_CONFIRM_FAIL';
      case 20:
        return 'AUTHENTICATION';
      case 30:
        return 'AUTHORIZED';
      default:
        return '';
    }
  };

  const handleClickProductDetail = () => {
    logEvent(attrKeys.legit.CLICK_LEGIT_INFO, {
      name: attrProperty.productName.LEGIT_PRODUCT,
      title: getLegitStatusName(),
      att: 'BACK_PRODUCT'
    });
    router.replace(`/products/${router.query.id}`);
  };

  return (
    <CTAButtonArea alignment="center" justifyContent="center" isButton={isButton()}>
      {data?.status === 11 ? (
        <Flexbox gap={8}>
          <CtaButton
            variant="contained"
            fullWidth
            size="large"
            customStyle={{ padding: 0, background: common.grey['95'] }}
            onClick={handleClickProductDetail}
          >
            <Typography weight="medium" variant="h4" customStyle={{ color: common.grey['20'] }}>
              보던 매물로 돌아가기
            </Typography>
          </CtaButton>
          <CtaButton
            brandColor="primary"
            variant="contained"
            fullWidth
            size="large"
            onClick={() => ChannelTalk.showMessenger()}
          >
            <Tooltip
              open
              brandColor="primary-highlight"
              message={
                <Typography weight="bold" variant="small1">
                  판매자에게 추가 사진을 받으셨다면, 1:1 상담 요청하세요!
                </Typography>
              }
              triangleLeft={250}
              customStyle={{ left: '-65%', top: -10 }}
            >
              1:1 요청하기
            </Tooltip>
          </CtaButton>
        </Flexbox>
      ) : (
        <CtaButton variant="contained" fullWidth size="large" onClick={handleClickProductDetail}>
          보던 매물로 돌아가기
        </CtaButton>
      )}
    </CTAButtonArea>
  );
}

const CTAButtonArea = styled(Flexbox)<{ isButton: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  border-top: 1px solid ${({ theme: { palette } }) => palette.common.grey['90']};
  background: ${({ theme: { palette } }) => palette.common.white};
  display: ${({ isButton }) => (isButton ? 'block' : 'none')};
`;

export default ProductLegitProcessCTAButton;
