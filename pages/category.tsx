import { useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';
import { QueryClient, dehydrate, useQuery } from 'react-query';
import type { GetServerSidePropsContext } from 'next';
import { Box, Flexbox, useTheme } from 'mrcamel-ui';

import { BottomNavigation, Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { CategoryBrandList, CategoryGenderTabs, CategoryList } from '@components/pages/category';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';
import { fetchParentCategories } from '@api/category';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import categoryState from '@recoil/category';

function Category() {
  const {
    theme: { palette }
  } = useTheme();
  const [{ initialized, parentId }, setCategoryState] = useRecoilState(categoryState);
  const [selectedParentCategory, setSelectedParentCategory] = useState(0);
  const { data: { info: { value: { gender: userInfoGender = '' } = {} } = {} } = {} } = useQuery(
    queryKeys.users.userInfo(),
    fetchUserInfo
  );

  useEffect(() => {
    logEvent(attrKeys.category.VIEW_CATEGORY);

    if (selectedParentCategory !== parentId) {
      setSelectedParentCategory(parentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const userGender = userInfoGender === 'F' ? 'female' : 'male';

    if (!initialized) {
      setCategoryState((prevCategory) => ({
        ...prevCategory,
        initialized: true,
        gender: userGender !== prevCategory.gender ? userGender : prevCategory.gender
      }));
    }
  }, [initialized, setCategoryState, userInfoGender]);

  return (
    <GeneralTemplate header={<Header />} footer={<BottomNavigation />} disablePadding>
      <Flexbox direction="vertical" gap={12} customStyle={{ marginBottom: 12 }}>
        <CategoryGenderTabs resetSelectedParentCategory={() => setSelectedParentCategory(0)} />
        <CategoryList
          selectedParentCategory={selectedParentCategory}
          setSelectedParentCategory={setSelectedParentCategory}
        />
        <Box customStyle={{ height: 8, backgroundColor: palette.common.grey['95'] }} />
        <CategoryBrandList />
      </Flexbox>
    </GeneralTemplate>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const queryClient = new QueryClient();
  const queryClientList: Promise<void>[] = [];

  Initializer.initAccessTokenByCookies(req.cookies);
  Initializer.initAccessUserInQueryClientByCookies(req.cookies, queryClient);

  if (req.cookies.accessToken) {
    queryClientList.concat([queryClient.prefetchQuery(queryKeys.users.userInfo(), fetchUserInfo)]);
  }

  queryClientList.concat([
    queryClient.prefetchQuery(queryKeys.categories.parentCategories(), fetchParentCategories)
  ]);

  await Promise.allSettled(queryClientList);

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

export default Category;
