import { useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Flexbox, Icon, Label, Switch } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import { Menu, MenuItem } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { putAlarm } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import { AllAlarmControllState } from '@recoil/mypage';

function WishProductAlarm({
  wishAlarm,
  saveProductAlarm,
  keywordAlarm
}: {
  wishAlarm?: boolean;
  saveProductAlarm?: boolean;
  keywordAlarm?: boolean;
}) {
  const router = useRouter();

  const {
    palette: { secondary }
  } = useTheme();

  const queryClient = useQueryClient();

  const [isWishAlarm, setIsWishAlarm] = useState(false);
  const [isSaveAlarm, setIsSaveAlarm] = useState(false);
  const [isKeywordAlarm, setIsKeywordAlarm] = useState(false);
  const { mutate: switchAlarm } = useMutation(putAlarm, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.alarms(),
        refetchType: 'inactive'
      });
    }
  });
  const [recoilAllAlarmCheck, setRecoilAllAlarmCheck] = useRecoilState(AllAlarmControllState);

  useEffect(() => {
    setIsWishAlarm(!!wishAlarm);
    setIsSaveAlarm(!!saveProductAlarm);
    setIsKeywordAlarm(!!keywordAlarm);
  }, [saveProductAlarm, wishAlarm, keywordAlarm]);

  const handleSaveProductsSwitch = () => {
    logEvent(attrKeys.mypage.CLICK_MYLIST_ALARM, { att: isSaveAlarm ? 'OFF' : 'ON' });
    setRecoilAllAlarmCheck({ ...recoilAllAlarmCheck, isNotiProductList: !isSaveAlarm });

    switchAlarm(
      {
        isNotiProductList: !isSaveAlarm
      },
      {
        onSuccess: () => {
          setIsSaveAlarm((props) => !props);
        }
      }
    );
  };

  const handleWishSwitch = () => {
    logEvent(attrKeys.mypage.CLICK_WISH_ALARM, { att: isWishAlarm ? 'OFF' : 'ON' });
    setRecoilAllAlarmCheck({ ...recoilAllAlarmCheck, isNotiProductWish: !isWishAlarm });

    switchAlarm(
      {
        isNotiProductWish: !isWishAlarm
      },
      {
        onSuccess: () => {
          setIsWishAlarm((props) => !props);
        }
      }
    );
  };

  const handleClickKeywordSwitch = () => {
    setRecoilAllAlarmCheck({ ...recoilAllAlarmCheck, isNotiKeyword: !isKeywordAlarm });

    switchAlarm(
      {
        isNotiKeyword: !isKeywordAlarm
      },
      {
        onSuccess: () => {
          setIsKeywordAlarm((props) => !props);
        }
      }
    );
  };

  const handleClickKeywordAlert = () => router.push('/mypage/settings/keywordAlert');

  const infoMenu = [
    {
      label: '저장한 매물 알림',
      check: isSaveAlarm,
      onSwitch: handleSaveProductsSwitch
    },
    {
      label: '찜한 매물 알림',
      check: isWishAlarm,
      onSwitch: handleWishSwitch
    },
    {
      label: '키워드 알림',
      check: isKeywordAlarm,
      onSwitch: handleClickKeywordSwitch
    }
  ];

  return (
    <Menu title="관심 매물 알림" gap={12}>
      {infoMenu.map(({ label, check, onSwitch }, index) => (
        <MenuItem
          key={`info-menu-${label}`}
          weight="medium"
          action={<Switch checked={check} onChange={onSwitch} size="large" />}
          customStyle={{
            marginTop: index === 0 ? 8 : undefined
          }}
        >
          {label}
        </MenuItem>
      ))}
      <MenuItem
        action={<Icon name="Arrow2RightOutlined" size="small" />}
        onClick={handleClickKeywordAlert}
      >
        <Flexbox gap={4} alignment="center">
          키워드 알림 설정
          <Label
            variant="solid"
            size="xsmall"
            brandColor="red"
            text="NEW"
            round={9}
            customStyle={{
              backgroundColor: secondary.red.light
            }}
          />
        </Flexbox>
      </MenuItem>
    </Menu>
  );
}

export default WishProductAlarm;
