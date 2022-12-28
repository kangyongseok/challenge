import { useRecoilValue } from 'recoil';
import { useMutation } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import PurchaseType from '@components/UI/organisms/PurchaseType';
import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import { postUserStyle } from '@api/user';

import { disabledState, purchaseTypeIdState } from '@recoil/onboarding';

function PurchaseInput() {
  const router = useRouter();
  const {
    theme: { palette }
  } = useTheme();
  const purchaseDisabledState = useRecoilValue(disabledState('purchase'));
  const purchaseTypeId = useRecoilValue(purchaseTypeIdState);
  const { mutate: styleMutate } = useMutation(postUserStyle);

  const handleSave = () => {
    styleMutate(
      {
        purchaseTypeIds: purchaseTypeId ? [purchaseTypeId] : []
      },
      {
        onSuccess: () => {
          router.back();
        }
      }
    );
  };

  return (
    <GeneralTemplate
      header={<Header hideTitle showRight={false} />}
      footer={
        <Footer>
          <Button
            fullWidth
            variant="solid"
            size="xlarge"
            disabled={purchaseDisabledState.open}
            brandColor="primary"
            onClick={handleSave}
          >
            저장
          </Button>
        </Footer>
      }
    >
      <Box customStyle={{ textAlign: 'center' }}>
        <Typography variant="h3" weight="bold" customStyle={{ marginBottom: 8 }}>
          중고구매에서 가장 중요한 것은?
        </Typography>
        <Typography customStyle={{ color: palette.common.ui60 }}>
          조건에 맞는 매물을 더 먼저 보여드릴게요
        </Typography>
      </Box>
      <PurchaseType />
    </GeneralTemplate>
  );
}

const Footer = styled.footer`
  position: fixed;
  bottom: 0;
  width: 100%;
  /* left: -12px; */
  padding: 20px;
  background-color: white;
`;

export default PurchaseInput;
