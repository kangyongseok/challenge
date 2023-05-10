import { useRecoilState, useSetRecoilState } from 'recoil';
import { useQuery } from '@tanstack/react-query';
import { BottomSheet, Button, Flexbox, Icon, Skeleton, Typography } from '@mrcamelhub/camel-ui';

import { fetchCommonCodeDetails } from '@api/common';

import queryKeys from '@constants/queryKeys';

import type { BankCode } from '@typings/tosspayments';
import {
  settingsAccountData,
  settingsAccountSelectBankBottomSheetOpenState
} from '@recoil/settingsAccount';

function SettingsAccountSelectBankBottomSheet() {
  const [open, setOpenState] = useRecoilState(settingsAccountSelectBankBottomSheetOpenState);
  const setSettingsAccountData = useSetRecoilState(settingsAccountData);

  const { data = [], isInitialLoading } = useQuery(
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

  const handleClick = (name: string) => () => {
    setSettingsAccountData((prevState) => ({
      ...prevState,
      bankCode: name as BankCode
    }));
    setOpenState(false);
  };

  return (
    <BottomSheet open={open} onClose={() => setOpenState(false)} disableSwipeable>
      <Flexbox
        gap={16}
        alignment="center"
        justifyContent="space-between"
        customStyle={{
          padding: '16px 20px'
        }}
      >
        <Typography variant="h3" weight="bold">
          은행 선택
        </Typography>
        <Icon name="CloseOutlined" onClick={() => setOpenState(false)} />
      </Flexbox>
      <Flexbox
        direction="vertical"
        customStyle={{
          marginTop: 12,
          padding: '0 20px'
        }}
      >
        {isInitialLoading &&
          Array.from({ length: 10 }).map((_, index) => (
            <Skeleton
              // eslint-disable-next-line react/no-array-index-key
              key={`bank-skeleton-${index}`}
              width={70}
              height={22}
              round={8}
              disableAspectRatio
              customStyle={{
                padding: '12px 0'
              }}
            />
          ))}
        {!isInitialLoading &&
          data.map(({ id, name, description }) => (
            <Button
              key={`bank-${id}`}
              variant="inline"
              size="large"
              brandColor="black"
              onClick={handleClick(name)}
              customStyle={{
                paddingRight: 0,
                paddingLeft: 0
              }}
            >
              {description}
            </Button>
          ))}
      </Flexbox>
    </BottomSheet>
  );
}

export default SettingsAccountSelectBankBottomSheet;
