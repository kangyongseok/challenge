import type { MouseEvent } from 'react';

import { useRecoilValue } from 'recoil';
import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { SearchHelperBanner } from '@components/pages/search';

import type { SuggestKeyword } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import commaNumber from '@utils/commaNumber';
import capitalize from '@utils/capitalize';

import type { TotalSearchItem } from '@typings/search';
import { showAppDownloadBannerState } from '@recoil/common';

interface SearchBrandListProps {
  item: SuggestKeyword;
  onClickList: (parameter: TotalSearchItem) => void;
}

function SearchBrandList({ item, onClickList }: SearchBrandListProps) {
  const {
    theme: { palette }
  } = useTheme();

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  const handleClickBrand = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    logEvent(attrKeys.search.CLICK_BANNERB, {
      name: 'SEARCH'
    });

    onClickList({
      keyword: target.dataset.brand,
      title: 'BANNERB',
      keywordItem: JSON.parse(target.dataset.item as string)
    });
  };

  const handleClickItem = (e: MouseEvent<HTMLLIElement>) => {
    const target = e.currentTarget;
    onClickList({
      keyword: target.dataset.keyword,
      keywordItem: JSON.parse(target.dataset.item as string)
    });
  };

  return (
    <Box>
      <ItemTitle
        data-keyword={item.keyword}
        data-brand={item.keywordBrand}
        data-item={JSON.stringify(item)}
        onClick={handleClickBrand}
        showAppDownloadBanner={showAppDownloadBanner}
      >
        <Flexbox gap={5} alignment="center">
          <strong>{capitalize(item.keywordEng)}</strong>
          {item.keywordBrand}
        </Flexbox>
        <Flexbox gap={9} alignment="center" customStyle={{ marginLeft: 'auto' }}>
          <Typography variant="small2" customStyle={{ color: palette.common.grey['60'] }}>
            ({commaNumber(item.count)})
          </Typography>
          <Icon name="CaretRightOutlined" color={palette.common.grey['40']} size="small" />
        </Flexbox>
      </ItemTitle>
      <Box customStyle={{ marginTop: 50 }}>
        <SearchHelperBanner
          keyword={item.keyword}
          brandName={item.brandName}
          brandId={item.brandId}
          categoryName={item.categoryName ?? undefined}
          parentId={item.parentId ?? undefined}
          subParentId={item.subParentId ?? undefined}
        />
        <ItemLi
          data-keyword={item.keyword}
          data-item={JSON.stringify(item)}
          onClick={handleClickItem}
          key={`list-${item.keyword}`}
        >
          <Flexbox gap={8} alignment="center">
            <span dangerouslySetInnerHTML={{ __html: item.keywordDeco }} />
            {item.count > 0 && (
              <Typography variant="small2" customStyle={{ color: palette.common.grey['60'] }}>
                ({commaNumber(item.count)})
              </Typography>
            )}
          </Flexbox>
        </ItemLi>
      </Box>
    </Box>
  );
}

const ItemTitle = styled.div<{ showAppDownloadBanner: boolean }>`
  display: flex;
  align-items: center;
  font-size: ${({ theme: { typography } }) => typography.small1.size};
  height: 50px;
  background: ${({ theme }) => theme.palette.common.grey['95']};
  width: 100%;
  position: absolute;
  left: 0;
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? 55 + APP_DOWNLOAD_BANNER_HEIGHT : 55}px;
  padding: 16px 26px;
  cursor: pointer;
  color: ${({ theme: { palette } }) => palette.common.grey['20']};
`;

const ItemLi = styled.li`
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
`;

export default SearchBrandList;
