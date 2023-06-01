import Gap from '@components/UI/atoms/Gap';

import RecentProductList from './RecentProductList';
import RecentKeywordList from './RecentKeywordList';
import PopularKeywordRank from './PopularKeywordRank';

function KeywordTabPanel() {
  return (
    <>
      <RecentKeywordList />
      <RecentProductList />
      <Gap height={8} />
      <PopularKeywordRank />
    </>
  );
}

export default KeywordTabPanel;
