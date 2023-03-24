import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Icon, Input, Typography, useTheme } from 'mrcamel-ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchUserAccounts, fetchUserCerts, postUserAccount } from '@api/user';
import { fetchCommonCodeDetails } from '@api/common';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  settingsAccountConfirmDialogOpenState,
  settingsAccountData,
  settingsAccountSelectBankBottomSheetOpenState
} from '@recoil/settingsAccount';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function SettingsAccountForm() {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [bankName, setBankName] = useState('');

  const [{ accountHolder, accountNumber, bankCode }, setSettingAccountDataState] =
    useRecoilState(settingsAccountData);

  const setOpenState = useSetRecoilState(settingsAccountSelectBankBottomSheetOpenState);
  const setConfirmDialogOpenState = useSetRecoilState(settingsAccountConfirmDialogOpenState);

  const { data: accessUser } = useQueryAccessUser();

  const {
    data = [],
    isLoading,
    refetch
  } = useQuery(queryKeys.users.userAccounts(), () => fetchUserAccounts(), {
    enabled: !!accessUser,
    refetchOnMount: true
  });

  const { data: userCerts = [], isLoading: isLoadingUserCerts } = useQuery(
    queryKeys.users.userCerts(),
    () => fetchUserCerts(),
    {
      enabled: !!accessUser,
      refetchOnMount: true
    }
  );

  const { data: banks = [] } = useQuery(
    queryKeys.commons.codeDetails({
      codeId: 19,
      groupId: 3
    }),
    () =>
      fetchCommonCodeDetails({
        codeId: 19,
        groupId: 3
      })
  );

  const { mutate, isLoading: isLoadingMutate } = useMutation(postUserAccount);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setSettingAccountDataState((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));

  const handleClick = () => {
    mutate(
      {
        accountHolder,
        accountNumber,
        bankCode
      },
      {
        onSuccess: async (response) => {
          logEvent(attrKeys.mypage.SUBMIT_USER_ACCOUNT, {
            name: attrProperty.name.ACCOUNT_MANAGE,
            data: {
              accountHolder,
              accountNumber,
              bankCode
            }
          });
          if (response) {
            await refetch();
            const lastPageUrl = SessionStorage.get<string>(sessionStorageKeys.lastPageUrl);

            if (lastPageUrl) {
              router.push(lastPageUrl);
            } else {
              router.push('/mypage');
            }
          } else {
            setConfirmDialogOpenState(true);
          }
        },
        onError: () => setConfirmDialogOpenState(true)
      }
    );
  };

  useEffect(() => {
    if (data[0] && !isLoading) {
      setSettingAccountDataState(data[0]);
    }
  }, [setSettingAccountDataState, data, isLoading]);

  useEffect(() => {
    if (bankCode && banks.length) {
      setBankName(banks.find(({ name }) => name === bankCode)?.description || '');
    }
  }, [bankCode, bankName, banks]);

  return (
    <Flexbox
      component="section"
      direction="vertical"
      gap={32}
      customStyle={{
        marginTop: 32,
        padding: '0 20px'
      }}
    >
      <Flexbox direction="vertical" gap={8}>
        <Typography
          weight="medium"
          customStyle={{
            color: common.ui60
          }}
        >
          예금주
        </Typography>
        <Input
          fullWidth
          size="large"
          name="accountHolder"
          placeholder="이름"
          onChange={handleChange}
          value={accountHolder}
        />
      </Flexbox>
      <Flexbox direction="vertical" gap={8}>
        <Typography
          weight="medium"
          customStyle={{
            color: common.ui60
          }}
        >
          은행
        </Typography>
        <SelectBox onClick={() => setOpenState(true)}>
          <Typography
            variant="h4"
            customStyle={{
              color: bankName ? undefined : common.ui80
            }}
          >
            {bankName || '은행선택'}
          </Typography>
          <Icon name="DropdownFilled" viewBox="0 0 12 24" color={common.ui60} />
        </SelectBox>
      </Flexbox>
      <Flexbox direction="vertical" gap={8}>
        <Typography
          weight="medium"
          customStyle={{
            color: common.ui60
          }}
        >
          계좌번호
        </Typography>
        <Input
          fullWidth
          size="large"
          name="accountNumber"
          onChange={handleChange}
          value={accountNumber}
          placeholder="계좌번호"
        />
      </Flexbox>
      <Box
        customStyle={{
          width: '100%',
          minHeight: 92
        }}
      >
        <Button
          variant="solid"
          brandColor="black"
          size="xlarge"
          fullWidth
          onClick={handleClick}
          disabled={
            !accountHolder ||
            !accountNumber ||
            !bankCode ||
            isLoading ||
            isLoadingUserCerts ||
            isLoadingMutate ||
            !userCerts.some(({ type }) => type === 0)
          }
          customStyle={{
            position: 'fixed',
            left: 0,
            bottom: 0,
            width: 'calc(100% - 40px)',
            margin: 20
          }}
        >
          완료
        </Button>
      </Box>
    </Flexbox>
  );
}

const SelectBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-height: 44px;
  padding: 12px;
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
  border-radius: 8px;
`;

export default SettingsAccountForm;
