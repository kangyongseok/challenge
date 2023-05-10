import type { MouseEvent } from 'react';

import { useRouter } from 'next/router';
import { debounce } from 'lodash-es';
import type { ChipProps } from '@mrcamelhub/camel-ui/dist/src/components/Chip';
import { Chip, Skeleton } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import type { CategoryValue } from '@dto/category';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

interface WishesCategoriesProps {
  isLoading: boolean;
  categories: CategoryValue[];
  selectedCategoryIds: number[];
}

function WishesCategories({ isLoading, categories, selectedCategoryIds }: WishesCategoriesProps) {
  const router = useRouter();
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
    <CategoriesWrapper>
      <Categories onScroll={handleScrollCategory}>
        {isLoading
          ? Array.from({ length: 10 }, (_, index) => (
              <Skeleton
                // eslint-disable-next-line react/no-array-index-key
                key={`wish-category-button-${index}`}
                height="33px"
                minWidth={`${(index % 2) * 47 + 81}px`}
                disableAspectRatio
                customStyle={{ borderRadius: 36, marginRight: index < 10 ? 6 : 0 }}
              />
            ))
          : categories.map((category, i) => {
              const isActive = selectedCategoryIds.includes(Number(category.id));
              const chipProps: ChipProps = isActive
                ? {
                    brandColor: 'black',
                    variant: 'solid'
                  }
                : {
                    variant: 'outline'
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
      </Categories>
    </CategoriesWrapper>
  );
}

const CategoriesWrapper = styled.section`
  position: relative;
  min-height: 60px;
  margin: 0 -20px;
`;

const Categories = styled.div`
  white-space: nowrap;
  overflow: auto;
  position: fixed;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  align-items: center;
  width: 100%;
  height: 60px;
  min-height: 60px;
  padding: 0 20px;
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
