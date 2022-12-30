import { useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';
import { QueryClient, dehydrate, useQuery } from 'react-query';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';
import { Flexbox } from 'mrcamel-ui';

import { BottomNavigation, Header } from '@components/UI/molecules';
import { Gap, PageHead } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { CategoryBrandList, CategoryGenderTabs, CategoryList } from '@components/pages/category';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';
import { fetchParentCategories } from '@api/category';

import queryKeys from '@constants/queryKeys';
import { APP_TOP_STATUS_HEIGHT, locales } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';
import { isExtendedLayoutIOSVersion } from '@utils/common';

import categoryState from '@recoil/category';

function Category() {
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
    <>
      <PageHead
        title="전국에서 중고명품 카테고리 모아드릴게요 | 카멜"
        description="중고명품, 이앱 저앱 모두 검색해보지 말고 카멜에서 바로 한번에 검색해보세요!"
        ogTitle="전국에서 중고명품 카테고리 모아드릴게요 | 카멜"
        ogDescription="중고명품, 이앱 저앱 모두 검색해보지 말고 카멜에서 바로 한번에 검색해보세요!"
        ogImage={`https://${process.env.IMAGE_DOMAIN}/assets/images/seo/main.webp`}
        ogUrl="https://mrcamel.co.kr/category"
      />
      <GeneralTemplate header={<Header />} footer={<BottomNavigation />} disablePadding>
        <Flexbox
          direction="vertical"
          gap={12}
          customStyle={{
            marginBottom: 12,
            paddingTop: isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0
          }}
        >
          <CategoryGenderTabs resetSelectedParentCategory={() => setSelectedParentCategory(0)} />
          <CategoryList
            selectedParentCategory={selectedParentCategory}
            setSelectedParentCategory={setSelectedParentCategory}
          />
          <Gap height={8} />
          <CategoryBrandList />
        </Flexbox>
      </GeneralTemplate>
    </>
  );
}

export async function getServerSideProps({
  req,
  locale: initialLocale,
  defaultLocale = locales.ko.lng
}: GetServerSidePropsContext) {
  const queryClient = new QueryClient();
  const queryClientList: Promise<void>[] = [];

  Initializer.initAccessTokenByCookies(getCookies({ req }));
  Initializer.initAccessUserInQueryClientByCookies(getCookies({ req }), queryClient);

  if (req.cookies.accessToken) {
    queryClientList.concat([queryClient.prefetchQuery(queryKeys.users.userInfo(), fetchUserInfo)]);
  }

  queryClientList.concat([
    queryClient.prefetchQuery(queryKeys.categories.parentCategories(), fetchParentCategories)
  ]);

  await Promise.allSettled(queryClientList);

  return {
    props: {
      ...(await serverSideTranslations(initialLocale || defaultLocale)),
      dehydratedState: dehydrate(queryClient)
    }
  };
}

export default Category;
