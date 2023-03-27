import { useEffect } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { Button, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import { useMutation } from '@tanstack/react-query';
import styled from '@emotion/styled';

import PurchaseType from '@components/UI/organisms/PurchaseType';
import Header from '@components/UI/molecules/Header';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { postUserStyle } from '@api/user';

import { purchaseType } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';

import { disabledState, purchaseTypeIdState } from '@recoil/onboarding';

function PurchaseInput() {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const purchaseDisabledState = useRecoilValue(disabledState('purchase'));
  const purchaseTypeId = useRecoilValue(purchaseTypeIdState);

  const { mutate: styleMutate } = useMutation(postUserStyle);

  const handleSave = () => {
    logEvent(attrKeys.userInput.SUBMIT_PERSONAL_INPUT, {
      name: attrProperty.name.BUYINGTYPE,
      att: purchaseType.find(({ value }) => value === purchaseTypeId)?.title || ''
    });
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

  useEffect(() => {
    logEvent(attrKeys.userInput.VIEW_PERSONAL_INPUT, {
      name: attrProperty.name.BUYINGTYPE
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      disablePadding
    >
      <Flexbox direction="vertical" gap={32} customStyle={{ flex: 1, padding: '20px 20px 144px' }}>
        <Flexbox component="section" direction="vertical" alignment="center" gap={4}>
          <Typography variant="h2" weight="bold">
            중고구매에서 가장 중요한 것은?
          </Typography>
          <Typography customStyle={{ color: common.ui60 }}>
            조건에 맞는 매물을 더 먼저 보여드릴게요
          </Typography>
        </Flexbox>
        <PurchaseType />
      </Flexbox>
    </GeneralTemplate>
  );
}

const Footer = styled.footer`
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 20px;
  background-color: ${({ theme: { palette } }) => palette.common.uiWhite};
`;

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  Initializer.initAccessTokenByCookies(getCookies({ req }));

  return {
    props: {}
  };
}

export default PurchaseInput;
