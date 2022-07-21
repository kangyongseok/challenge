import { Dispatch, MouseEvent, SetStateAction, useCallback, useEffect } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { Box } from 'mrcamel-ui';

import { Tabs } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';

import { GENDER } from '@constants/user';
import queryKeys from '@constants/queryKeys';
import { APP_DOWNLOAD_BANNER_HEIGHT, HEADER_HEIGHT } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { PortalConsumer } from '@utils/PortalProvider';

import { showAppDownloadBannerState } from '@recoil/common';
import categoryState from '@recoil/category';

interface CategoryTabsProps {
  setSelectedParentCategory: Dispatch<SetStateAction<number>>;
}

function CategoryTabs({ setSelectedParentCategory }: CategoryTabsProps) {
  const [{ gender }, setCategoryState] = useRecoilState(categoryState);
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const { data } = useQuery(queryKeys.users.userInfo(), fetchUserInfo);

  useEffect(() => {
    if (data) {
      setCategoryState((prevCategory) => ({
        ...prevCategory,
        gender: data.info.value.gender === 'F' ? 'female' : 'male'
      }));
    }
  }, [data]);

  const changeSelectedValue = useCallback(
    (_: MouseEvent<HTMLButtonElement>, newValue: string) => {
      logEvent(attrKeys.category.CLICK_CATEGORY_GENDER, {
        name: 'CATEGORY',
        gender: newValue === 'male' ? 'M' : 'F'
      });
      setCategoryState((prevCategory) => ({
        ...prevCategory,
        gender: newValue as keyof typeof GENDER
      }));
      setSelectedParentCategory(0);
    },
    [setCategoryState, setSelectedParentCategory]
  );

  return (
    <PortalConsumer>
      <Box
        customStyle={{
          position: 'fixed',
          top: showAppDownloadBanner ? HEADER_HEIGHT + APP_DOWNLOAD_BANNER_HEIGHT : HEADER_HEIGHT,
          width: '100%'
        }}
      >
        <Tabs
          value={gender}
          changeValue={changeSelectedValue}
          labels={Object.entries(GENDER).map(([key, value]) => ({ key, value }))}
        />
      </Box>
    </PortalConsumer>
  );
}

export default CategoryTabs;
