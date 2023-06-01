import { useRecoilValue } from 'recoil';
import { useQuery } from '@tanstack/react-query';

import { BottomNavigation } from '@components/UI/molecules';

import { fetchKeywordsSuggest } from '@api/product';

import queryKeys from '@constants/queryKeys';

import { searchValueState } from '@recoil/search';

function SearchBottomNavigation() {
  const value = useRecoilValue(searchValueState);

  const { data = [] } = useQuery(
    queryKeys.products.keywordsSuggest(value),
    () => fetchKeywordsSuggest(value),
    {
      enabled: !!value
    }
  );

  if (value && data && data.length) return null;

  return <BottomNavigation />;
}

export default SearchBottomNavigation;
