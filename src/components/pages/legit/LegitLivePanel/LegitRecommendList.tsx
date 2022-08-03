import { useEffect, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import {
  BottomSheet,
  Box,
  Button,
  CtaButton,
  Flexbox,
  Label,
  Typography,
  useTheme
} from 'mrcamel-ui';
import styled from '@emotion/styled';

import { ProductLegitCard } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { fetchUserLegitTargets } from '@api/user';
import { postProductLegit } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { deviceIdState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function LegitRecommendList() {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const deviceId = useRecoilValue(deviceIdState);

  const [open, setOpen] = useState(false);

  const { data: accessUser } = useQueryAccessUser();

  const { data: products = [] } = useQuery(queryKeys.users.legitTargets(), fetchUserLegitTargets, {
    enabled: !!accessUser,
    refetchOnMount: true
  });

  const { mutateAsync, isSuccess } = useMutation(postProductLegit);

  const handleClick = async () => {
    logEvent(attrKeys.legit.CLICK_LEGIT_MODAL, {
      name: attrProperty.legitName.LEGIT_MAIN,
      att: 'OK'
    });

    const mutates = products.map(({ id }) =>
      mutateAsync(
        { id, deviceId },
        {
          onSettled: () => setOpen(false)
        }
      )
    );

    await Promise.all(mutates);
  };

  useEffect(() => {
    if (isSuccess && !open)
      router.push(
        {
          pathname: '/legit',
          query: {
            tab: 'my',
            openCompleteToast: true
          }
        },
        undefined,
        { shallow: true }
      );
  }, [isSuccess, open, router]);

  useEffect(() => {
    if (accessUser && products.length) {
      logEvent(attrKeys.legit.VIEW_LEGIT_WISH, {
        name: attrProperty.legitName.LEGIT_MAIN
      });
    }
  }, [accessUser, products]);

  if (!accessUser || !products.length) return null;

  return (
    <>
      <StyledLegitRecommendGrid component="section" direction="vertical" gap={24}>
        <NewLabel text="NEW" size="xsmall" brandColor="black" />
        <Typography variant="h4" customStyle={{ color: common.white }}>
          {accessUser.userName || '회원'}님의 찜/최근 매물 중<br />
          <strong>사진감정가능한 3개를 추렸어요</strong>
        </Typography>
        <Flexbox
          direction="vertical"
          gap={20}
          customStyle={{ '& *': { color: `${common.white} !important` } }}
        >
          {products.map((product) => (
            <ProductLegitCard
              key={`recommend-product-legit-${product.id}`}
              variant="list"
              productLegit={{
                productResult: product
              }}
              hidePlatformLogo
              hideProductLegitLabelWithDate
            />
          ))}
        </Flexbox>
        <Button
          variant="outlined"
          fullWidth
          brandColor="black"
          disabled={!products.length}
          onClick={() => {
            logEvent(attrKeys.legit.CLICK_LEGIT_WISH, {
              name: attrProperty.legitName.LEGIT_MAIN
            });
            setOpen(true);
          }}
        >
          모두 실시간 사진감정 해보기
        </Button>
      </StyledLegitRecommendGrid>
      <BottomSheet open={open} onClose={() => setOpen(false)} disableSwipeable>
        <Box customStyle={{ padding: '24px 20px 20px' }}>
          <Typography variant="h4">
            {accessUser.userName || '회원'}님이 관심있어하신 3건의 매물,{' '}
            <strong>실시간 정가품 의견</strong> 받아보시겠어요?
          </Typography>
          <Typography weight="medium" customStyle={{ marginTop: 16, color: common.grey['40'] }}>
            🤑 베타기간 내 감정비용은 무료입니다!
          </Typography>
          <Flexbox gap={8} customStyle={{ marginTop: 32 }}>
            <CtaButton
              fullWidth
              variant="ghost"
              size="large"
              onClick={() => {
                logEvent(attrKeys.legit.CLICK_LEGIT_MODAL, {
                  name: attrProperty.legitName.LEGIT_MAIN,
                  att: 'CLOSE'
                });
                setOpen(false);
              }}
              customStyle={{ minWidth: 108, maxWidth: 108 }}
            >
              다음에
            </CtaButton>
            <CtaButton
              fullWidth
              variant="contained"
              brandColor="primary"
              size="large"
              onClick={handleClick}
            >
              네 좋아요
            </CtaButton>
          </Flexbox>
        </Box>
      </BottomSheet>
    </>
  );
}

const StyledLegitRecommendGrid = styled(Flexbox)`
  position: relative;
  margin-top: 42px;
  padding: 32px 20px 20px 20px;
  background-color: #151729;
  border-radius: ${({ theme: { box } }) => box.round['8']};
`;

const NewLabel = styled(Label)`
  position: absolute;
  top: -11.5px;
  left: 20px;
  height: auto;
  border-radius: 10px;
  border-width: 2px;
  font-weight: 700;
`;

export default LegitRecommendList;
