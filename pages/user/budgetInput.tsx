import { useEffect, useState } from 'react';

import { useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Button, Flexbox } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { UserBudget } from '@components/pages/user';

import { logEvent } from '@library/amplitude';

import { fetchUserInfo, postUserBudget } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

function BudgetInput() {
  const router = useRouter();
  const [budget, setBudget] = useState<number>();
  const isSubmittable = typeof budget === 'number';
  const { data: userInfo } = useQuery(queryKeys.users.userInfo(), fetchUserInfo);
  const { isLoading, mutate } = useMutation(postUserBudget, {
    onSuccess: () => {
      router.back();
    }
  });

  useEffect(() => {
    logEvent(attrKeys.userInput.VIEW_PERSONAL_INPUT, { name: 'BUDGET' });
  }, []);

  useEffect(() => {
    if (userInfo && !budget) {
      setBudget(userInfo.maxMoney);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);

  return (
    <GeneralTemplate
      header={<Header hideTitle showRight={false} />}
      footer={
        <Footer>
          <Flexbox gap={8} direction="vertical" alignment="center" justifyContent="center">
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={!isSubmittable || isLoading}
              brandColor="primary"
              onClick={() => {
                if (isSubmittable) {
                  mutate(budget);
                }
              }}
            >
              저장
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              disabled={isLoading}
              brandColor="primary"
              onClick={() => {
                logEvent(attrKeys.userInput.SUBMIT_PERSONAL_INPUT, {
                  name: 'BUDGET',
                  title: 'INPUT'
                });
                setBudget(undefined);
                mutate(-1);
              }}
            >
              예산 상관없이 보여주세요
            </Button>
          </Flexbox>
        </Footer>
      }
    >
      <UserBudget budget={budget} setBudget={setBudget} />
    </GeneralTemplate>
  );
}

const Footer = styled.footer`
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 20px 20px 24px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
`;

export default BudgetInput;
