import { useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { Button, Flexbox, Input } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';

import { logEvent } from '@library/amplitude';

import { fetchAlarm } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import {
  keywordAlertManageBottomSheetState,
  keywordAlertOffDialogOpenState
} from '@recoil/keywordAlert';

function SettingsKeywordAlertForm() {
  const [keyword, setKeyword] = useState('');

  const setKeywordAlertManageBottomSheetState = useSetRecoilState(
    keywordAlertManageBottomSheetState
  );
  const setKeywordAlertOffOpenState = useSetRecoilState(keywordAlertOffDialogOpenState);

  const { data: { isNotiKeyword } = {} } = useQuery(queryKeys.users.alarms(), fetchAlarm, {
    refetchOnMount: true
  });

  const handleClick = () => {
    logEvent(attrKeys.mypage.CLICK_KEYWORD_ALERT, {
      att: 'CREATE',
      keyword
    });

    if (!isNotiKeyword) {
      setKeywordAlertManageBottomSheetState((prevState) => ({
        ...prevState,
        keyword
      }));
      setKeywordAlertOffOpenState(true);
    } else {
      setKeyword('');
      setKeywordAlertManageBottomSheetState((prevState) => ({
        ...prevState,
        open: true,
        keyword
      }));
    }
  };

  return (
    <Flexbox
      component="section"
      gap={8}
      customStyle={{
        marginTop: 32
      }}
    >
      <Input
        size="large"
        onChange={(e) => setKeyword(e.currentTarget.value)}
        value={keyword}
        placeholder="키워드를 입력해주세요. (예: 가방)"
        fullWidth
        maxLength={20}
      />
      <Button
        variant="solid"
        size="large"
        brandColor="black"
        onClick={handleClick}
        disabled={!keyword}
        customStyle={{
          minWidth: 55
        }}
      >
        등록
      </Button>
    </Flexbox>
  );
}

export default SettingsKeywordAlertForm;
