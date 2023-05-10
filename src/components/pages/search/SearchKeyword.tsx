import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import find from 'lodash-es/find';
import { Chip, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { searchRecentSearchListState } from '@recoil/search';

const keywords = [
  '샤넬 클래식 미디움',
  '나이키 범고래',
  '스톤 맨투맨',
  '루이비통 지갑',
  '구찌 마몬트 숄더백',
  '나이키 조던1'
];

function SearchKeyword({ handleClickSaveTime }: { handleClickSaveTime: () => void }) {
  const router = useRouter();
  const {
    theme: { typography }
  } = useTheme();
  const [savedRecentSearchList, setSavedRecentSearchList] = useRecoilState(
    searchRecentSearchListState
  );

  const handleClick = (keyword: string) => () => {
    logEvent(attrKeys.search.CLICK_RECOMMTAG, {
      name: 'SEARCH',
      keyword
    });

    if (!find(savedRecentSearchList, { keyword })) {
      setSavedRecentSearchList((currVal) => [{ keyword, count: 0, expectCount: 0 }, ...currVal]);
    }

    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.productName.SEARCH,
      title: attrProperty.productTitle.RECOMMTAG,
      type: attrProperty.productType.GUIDED
    });

    handleClickSaveTime();
    router.push({
      pathname: `/products/search/${keyword}`
    });
  };

  return (
    <Flexbox component="section" direction="vertical" gap={12} customStyle={{ marginTop: 20 }}>
      <Typography variant="h4" weight="bold" customStyle={{ padding: '0 20px' }}>
        추천 검색어
      </Typography>
      <Flexbox
        customStyle={{
          flexWrap: 'wrap',
          gap: '8px 6px',
          padding: '0 20px'
        }}
      >
        {keywords.map((keyword) => (
          <Chip
            key={`search-${keyword}`}
            variant="ghost"
            brandColor="black"
            onClick={handleClick(keyword)}
            customStyle={{ fontWeight: typography.body1.weight.regular }}
          >
            {keyword}
          </Chip>
        ))}
      </Flexbox>
    </Flexbox>
  );
}

export default SearchKeyword;
