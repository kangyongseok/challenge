import { MouseEvent } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import type { ChipProps } from 'mrcamel-ui/dist/components/Chip';
import { Chip } from 'mrcamel-ui';
import { debounce } from 'lodash-es';
import styled from '@emotion/styled';

import type { CategoryValue } from '@dto/category';

import { logEvent } from '@library/amplitude';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { showAppDownloadBannerState } from '@recoil/common';

interface WishesCategoriesProps {
  categories: CategoryValue[];
  selectedCategoryIds: number[];
}

function WishesCategories({ categories, selectedCategoryIds }: WishesCategoriesProps) {
  const router = useRouter();
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const handleSetIds = (e: MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    const isActive = selectedCategoryIds.includes(Number(target.dataset.id));
    logEvent(attrKeys.wishes.CLICK_CATEGORY, {
      name: attrProperty.name.wishList,
      idx: target.dataset.index,
      id: target.dataset.id,
      category: target.dataset.name,
      title: 'WISH_PRODUCT',
      type: 'PARENT_CATEGORY',
      checked: isActive
    });

    let query = {
      ...router.query
    };

    if (isActive) {
      query = {
        ...query,
        selectedCategoryIds: selectedCategoryIds
          .filter((id) => id !== Number(target.dataset.id))
          .toString()
      };
    } else {
      query = {
        ...query,
        selectedCategoryIds: selectedCategoryIds.concat(Number(target.dataset.id)).toString()
      };
    }

    if (!query.selectedCategoryIds) delete query.selectedCategoryIds;

    router.replace({
      pathname: router.pathname,
      query
    });
  };

  const handleScrollCategory = debounce(() => {
    logEvent(attrKeys.wishes.SWIPE_X_TAG, {
      name: attrProperty.name.wishList
    });
  }, 500);

  return (
    <CategoriesWrapper
      showAppDownloadBanner={showAppDownloadBanner}
      onScroll={handleScrollCategory}
    >
      {categories.map((category, i) => {
        const isActive = selectedCategoryIds.includes(Number(category.id));
        const chipProps: ChipProps = isActive
          ? {
              brandColor: 'black',
              variant: 'contained'
            }
          : {
              variant: 'outlined'
            };

        return (
          <Chip
            key={`wish-category-button-${category.id}`}
            size="small"
            data-id={category.id}
            data-index={i + 1}
            data-name={category.name}
            isRound={false}
            {...chipProps}
            onClick={handleSetIds}
            customStyle={{
              whiteSpace: 'nowrap',
              height: 33,
              borderRadius: 36,
              padding: '6px 12px'
            }}
          >
            {category.name.replace('(P)', '') || '없음'} {category.count}
          </Chip>
        );
      })}
    </CategoriesWrapper>
  );
}

const CategoriesWrapper = styled.div<{ showAppDownloadBanner: boolean }>`
  white-space: nowrap;
  overflow: auto;
  position: fixed;
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? 97 + APP_DOWNLOAD_BANNER_HEIGHT : 97}px;
  width: 100%;
  margin: 0 -20px;
  padding: 20px 20px 8px 20px;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};

  & > button {
    margin-right: 6px;
    &:last-child {
      margin-right: 0;
    }
  }
`;

export default WishesCategories;
