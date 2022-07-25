import type { MouseEvent } from 'react';

import { Box, Chip, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import { RECENT_SEARCH_LIST } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import accumulateStorage from '@utils/search/accumulateStorage';

import type { SelectItem } from '@typings/search';

interface SearchKeywordProps {
  onClick: (parameter: SelectItem) => void;
}

const keywords = [
  '샤넬 클래식 미디움',
  '나이키 범고래',
  '스톤 맨투맨',
  '루이비통 지갑',
  '구찌 마몬트 숄더백',
  '나이키 조던1'
];

function SearchKeyword({ onClick }: SearchKeywordProps) {
  const {
    theme: { palette }
  } = useTheme();

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const target = e.target as HTMLButtonElement;

    logEvent(attrKeys.search.CLICK_RECOMMTAG, {
      name: 'SEARCH',
      keyword: target.dataset.keyword
    });

    accumulateStorage(RECENT_SEARCH_LIST, {
      keyword: target.dataset.keyword,
      count: Number(target.dataset.count)
    });

    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.productName.SEARCH,
      title: attrProperty.productTitle.RECOMMTAG,
      type: attrProperty.productType.GUIDED
    });

    onClick({ keyword: target.dataset.keyword });
  };

  return (
    <Box customStyle={{ marginTop: 16 }}>
      <Typography
        variant="h4"
        weight="bold"
        customStyle={{
          marginBottom: 4
        }}
      >
        최근 본 상품이 없네요!
      </Typography>
      <Typography
        variant="small1"
        customStyle={{
          color: palette.common.grey['40']
        }}
      >
        이런 매물은 어떠세요?😎
      </Typography>
      <Flexbox
        customStyle={{
          flexWrap: 'wrap',
          marginTop: 12,
          gap: '8px 6px'
        }}
      >
        {keywords.map((keyword) => (
          <Chip
            variant="ghost"
            brandColor="black"
            data-keyword={keyword}
            key={`search-${keyword}`}
            onClick={handleClick}
          >
            {keyword}
          </Chip>
        ))}
      </Flexbox>
    </Box>
  );
}

export default SearchKeyword;
