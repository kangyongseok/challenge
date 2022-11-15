import { MouseEvent, useEffect, useMemo, useState } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Chip, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Header } from '@components/UI/molecules';
import { Skeleton } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import type { SubParentCategory } from '@dto/category';

import LocalStorage from '@library/localStorage';
import ChannelTalk from '@library/channelTalk';
import { logEvent } from '@library/amplitude';

import { fetchParentCategories } from '@api/category';

import queryKeys from '@constants/queryKeys';
import { CAMEL_SELLER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { CamelSellerLocalStorage } from '@typings/camelSeller';

function SelectCategory() {
  const { query, push } = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const [camelSeller, setCamelSeller] = useState<CamelSellerLocalStorage>();

  const { data: parentCategories, isLoading } = useQuery(
    queryKeys.categories.parentCategories(),
    fetchParentCategories
  );

  const [parentCategory, setParentCategory] = useState('');
  const [targetSubParentCategory, setTargetSubParentCategory] = useState<SubParentCategory[]>([]);

  const attTitle = useMemo(() => {
    return query.title ? attrProperty.title.NO_MODEL : attrProperty.title.DONTKNOW_MODEL;
  }, [query.title]);

  useEffect(() => {
    setCamelSeller(LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage);
    ChannelTalk.hideChannelButton();
  }, []);

  useEffect(() => {
    logEvent(attrKeys.camelSeller.VIEW_PRODUCT_CATEGORY, {
      title: attTitle
    });
  }, [camelSeller, attTitle]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    logEvent(attrKeys.camelSeller.CLICK_CATEGORY, {
      name: attrProperty.name.PRODUCT_CATEGORY,
      title: attTitle,
      att: target.dataset.parentName,
      step: 1
    });

    setParentCategory(String(target.dataset.parentName));
    if (parentCategories) {
      setTargetSubParentCategory(
        parentCategories[Number(target.dataset.index)].subParentCategories
      );
    }
  };

  const handleClickSubCategory = (e: MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    logEvent(attrKeys.camelSeller.CLICK_CATEGORY, {
      name: attrProperty.name.PRODUCT_CATEGORY,
      title: attTitle,
      att: target.dataset.subParentName,
      step: 2
    });

    push({
      pathname: '/camelSeller/selectBrand',
      query: {
        ...query,
        categoryIds: Number(target.dataset.subParentId),
        categoryName: target.dataset.subParentName
      }
    });
  };

  const handlePreviouse = () => {
    setTargetSubParentCategory([]);
    setParentCategory('');
  };

  return (
    <GeneralTemplate
      header={<Header showRight={false} disableAppDownloadBannerVariableTop />}
      hideAppDownloadBanner
    >
      <Box customStyle={{ margin: '32px 0' }}>
        {query.title ? (
          <>
            <Typography variant="h3">
              <UnderLineTitle>{query.title}</UnderLineTitle>은(는)
            </Typography>
            <Typography variant="h2" weight="bold" customStyle={{ marginTop: 8 }}>
              <HighlightTitle>어떤 카테고리</HighlightTitle>인가요?
            </Typography>
          </>
        ) : (
          <Typography variant="h2" weight="bold" customStyle={{ marginTop: 8 }}>
            <HighlightTitle>어떤 물건</HighlightTitle>을 판매할까요?
          </Typography>
        )}
      </Box>
      <PrevButton
        variant="contained"
        parentCategory={!!parentCategory}
        startIcon={
          <Icon
            name="CaretLeftOutlined"
            customStyle={{ color: `${common.ui20}!important` }}
            size="small"
            height={10}
            width={6}
          />
        }
        onClick={handlePreviouse}
      >
        {parentCategory}
      </PrevButton>
      <Flexbox gap={12} customStyle={{ flexWrap: 'wrap' }}>
        {isLoading &&
          Array.from({ length: 8 }, (_, i) => i + 1).map((v) => (
            <Skeleton
              height="61px"
              ratio="2:1"
              width="150px"
              key={`text-${v}}`}
              disableAspectRatio
              customStyle={{ borerRadius: 4 }}
            />
          ))}
        {targetSubParentCategory.length > 0 &&
          targetSubParentCategory.map((subParent) => (
            <CategoryChip
              key={`select-category-${subParent.id}`}
              isRound={false}
              data-sub-parent-id={subParent.id}
              data-sub-parent-name={subParent.name.replace('(P)', '')}
              onClick={handleClickSubCategory}
            >
              {subParent.name.replace('(P)', '')}
            </CategoryChip>
          ))}
        {targetSubParentCategory.length === 0 &&
          parentCategories?.map((category, i) => (
            <CategoryChip
              key={`select-category-${category.parentCategory.id}`}
              isRound={false}
              data-parent-id={category.parentCategory.id}
              data-parent-name={category.parentCategory.name.replace('(P)', '')}
              data-index={i}
              onClick={handleClick}
            >
              {category.parentCategory.name.replace('(P)', '')}
            </CategoryChip>
          ))}
      </Flexbox>
    </GeneralTemplate>
  );
}

const UnderLineTitle = styled.span`
  border-bottom: 2px solid ${({ theme: { palette } }) => palette.primary.main};
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui20};
  font-weight: ${({ theme }) => theme.typography.body2.weight.bold};
  word-break: break-all;
`;
const HighlightTitle = styled.span`
  color: ${({ theme: { palette } }) => palette.primary.main};
`;

const PrevButton = styled(Button)<{ parentCategory: boolean }>`
  display: ${({ parentCategory }) => (parentCategory ? 'flex' : 'none')};
  margin-bottom: 12px;
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui20};
  font-size: ${({ theme: { typography } }) => typography.small1.size};
  align-items: center;
  background: ${({ theme: { palette } }) => palette.common.ui95};
`;

const CategoryChip = styled(Chip)`
  min-width: calc(50% - 12px);
  height: 61px;
  border: 2px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui95};
  font-weight: ${({ theme: { typography } }) => typography.body1.weight.medium};
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui20};
`;

export default SelectCategory;
