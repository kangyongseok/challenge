import { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';
import { QueryClient, dehydrate } from '@tanstack/react-query';

import { PageHead } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  SearchBottomNavigation,
  SearchHeader,
  SearchList,
  SearchTabGroup,
  SearchTabPanels
} from '@components/pages/search';

import UserTraceRecord from '@library/userTraceRecord';
import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

function Search() {
  const router = useRouter();
  const { tab = 'keyword' } = router.query;

  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    UserTraceRecord.increasePageViewCount('exitSearch');
  }, []);

  useEffect(() => {
    logEvent(attrKeys.search.VIEW_SEARCH_MODAL, {
      title: tab
    });
  }, [tab]);

  return (
    <>
      <PageHead
        title="검색만 하면 전국에서 중고명품 모아드릴게요 | 카멜"
        description="중고명품, 이앱 저앱 모두 검색해보지 말고 카멜에서 바로 한번에 검색해보세요!"
        ogTitle="검색만 하면 전국에서 중고명품 모아드릴게요 | 카멜"
        ogDescription="중고명품, 이앱 저앱 모두 검색해보지 말고 카멜에서 바로 한번에 검색해보세요!"
        ogImage={`https://${process.env.IMAGE_DOMAIN}/assets/images/seo/main.webp`}
      />
      <GeneralTemplate footer={<SearchBottomNavigation />} disablePadding>
        <SearchHeader headerRef={headerRef} />
        <SearchTabGroup headerRef={headerRef} />
        <SearchTabPanels />
        <SearchList />
      </GeneralTemplate>
    </>
  );
}

export async function getStaticProps() {
  const queryClient = new QueryClient();

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

export default Search;
