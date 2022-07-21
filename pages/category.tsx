import { useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';
import { QueryClient, dehydrate } from 'react-query';
import { GetServerSidePropsContext } from 'next';

import { BottomNavigation, Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { CategoryCollapse, CategoryTabs } from '@components/pages/category';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchParentCategories } from '@api/category';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import categoryState from '@recoil/category';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function Category() {
  const { data: accessUser } = useQueryAccessUser();
  const [{ initialized, gender, parentId }, setCategoryState] = useRecoilState(categoryState);
  const [selectedParentCategory, setSelectedParentCategory] = useState(0);

  useEffect(() => {
    logEvent(attrKeys.category.VIEW_CATEGORY);
  }, []);

  useEffect(() => {
    if (selectedParentCategory !== parentId) {
      setSelectedParentCategory(parentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentId]);

  useEffect(() => {
    const userGender = accessUser?.gender === 'F' ? 'female' : 'male';

    if (userGender !== gender && !initialized) {
      setCategoryState((prevCategory) => ({
        ...prevCategory,
        initialized: true,
        gender: userGender
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessUser]);

  return (
    <GeneralTemplate header={<Header />} footer={<BottomNavigation />}>
      <CategoryTabs setSelectedParentCategory={setSelectedParentCategory} />
      <CategoryCollapse
        selectedParentCategory={selectedParentCategory}
        setSelectedParentCategory={setSelectedParentCategory}
      />
    </GeneralTemplate>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const queryClient = new QueryClient();

  Initializer.initAccessTokenByCookies(req.cookies);
  Initializer.initAccessUserInQueryClientByCookies(req.cookies, queryClient);

  await queryClient.prefetchQuery(queryKeys.categories.parentCategories(), fetchParentCategories);

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

export default Category;
