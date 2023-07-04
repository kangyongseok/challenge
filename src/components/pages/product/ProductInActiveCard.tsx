import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Box, Chip, Flexbox, Image, Skeleton, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { Gap } from '@components/UI/atoms';

import type { Product } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchRelatedKeywords } from '@api/product';

import { productType } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { noop } from '@utils/common';

interface KeywordList {
  keyword: string;
  symbol?: string;
  icon?: string;
  name?: string;
}

interface ProductInActiveCardProps {
  variant?: 'soldOut' | 'delete';
  product?: Product;
  setViewDetailProduct?: (value: boolean) => void;
  isSafe: boolean;
}

function ProductInActiveCard({
  variant = 'soldOut',
  product,
  isSafe,
  setViewDetailProduct
}: ProductInActiveCardProps) {
  const router = useRouter();

  const [keywordList, setKeywordList] = useState<KeywordList[]>([]);

  const relatedKeywordParams = {
    quoteTitle: product?.quoteTitle || '',
    brandIds: product?.brand?.id ? [product?.brand?.id] : [],
    categoryIds: product?.category?.id ? [product?.category?.id] : []
  };

  const { data: fetchKeywordsData, isLoading } = useQuery(
    queryKeys.products.searchRelatedKeyword(relatedKeywordParams),
    () => fetchRelatedKeywords(relatedKeywordParams),
    {
      enabled: !!relatedKeywordParams.quoteTitle
    }
  );

  const isNormalSeller = product?.sellerType === productType.normal;

  const handleClick = (item: KeywordList) => () => {
    let viewType = 'search';
    const productKeyword = item.name?.replace('(P)', '') || item.keyword;

    if (item.symbol) {
      viewType = 'brands';
    }
    if (item.icon) {
      viewType = 'categories';
    }

    if (viewType === 'brands') {
      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.name.PRODUCT_DETAIL,
        title: attrProperty.title.BRAND
      });
    } else if (viewType === 'categories') {
      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.name.PRODUCT_DETAIL,
        title: attrProperty.title.CATEGORY
      });
    } else {
      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.name.PRODUCT_DETAIL,
        title: attrProperty.title.RECOMMKEYWORD
      });
    }

    router.push(`/products/${viewType}/${encodeURIComponent(String(productKeyword))}`);
  };

  useEffect(() => {
    logEvent(attrKeys.products.VIEW_SOLDOUT, {
      name: attrProperty.name.productDetail
    });
  }, []);

  useEffect(() => {
    const result = [
      {
        ...fetchKeywordsData?.brand,
        keyword: fetchKeywordsData?.brand?.nameEng.toUpperCase() || '',
        symbol: fetchKeywordsData?.brand?.nameEng[0].toUpperCase() || ''
      },
      {
        ...fetchKeywordsData?.category,
        keyword: fetchKeywordsData?.category?.name.replace('(P)', '') || '',
        icon: fetchKeywordsData?.categoryThumbnail || ''
      },
      ...(fetchKeywordsData?.relatedKeywords?.map((keyword) => ({ keyword })) || [])
    ];
    if (fetchKeywordsData) {
      setKeywordList(result);
    }
  }, [fetchKeywordsData]);

  return (
    <>
      <Box
        component="section"
        customStyle={{
          width: 'calc(100% + 40px)',
          margin: '0 -20px',
          padding: '20px 0'
        }}
        onClick={setViewDetailProduct ? () => setViewDetailProduct(true) : noop}
      >
        <Flexbox
          justifyContent="space-between"
          gap={20}
          customStyle={{
            padding: '0 20px'
          }}
        >
          <Flexbox
            direction="vertical"
            gap={4}
            customStyle={{
              flexGrow: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            <Typography
              variant="body2"
              color="ui60"
              noWrap
              customStyle={{
                marginTop: 8
              }}
            >
              {!isNormalSeller && isSafe && <span>안전결제 </span>}
              {product?.title}
            </Typography>
            <Typography variant="h3" weight="bold" noWrap>
              {variant === 'soldOut' ? '이미 판매된 매물이에요.' : '삭제된 매물이에요.'}
            </Typography>
          </Flexbox>
          <Image
            width={50}
            height={60}
            src={product?.imageMain || ''}
            alt="Product Img"
            round={8}
            disableAspectRatio
            customStyle={{
              minWidth: 50
            }}
          />
        </Flexbox>
        <List>
          {(isLoading || !keywordList.length) &&
            Array.from({ length: 10 })
              .map((_, index) => index)
              .map((index) => (
                <Skeleton
                  key={`keyword-list-skeleton-${index}`}
                  width={100}
                  height={32}
                  round={16}
                  disableAspectRatio
                />
              ))}
          {!isLoading &&
            keywordList
              .filter((list) => !!list.keyword)
              .map((item) => (
                <Chip
                  key={`keyword-list-${item.keyword}`}
                  size="medium"
                  onClick={handleClick(item)}
                  customStyle={{
                    padding: item.icon || item.symbol ? '4px 12px 4px 4px' : '6px 12px'
                  }}
                >
                  {item.icon && (
                    <CircleBg>
                      <Image
                        width={18}
                        height={18}
                        src={item.icon}
                        alt={item.keyword}
                        disableAspectRatio
                      />
                    </CircleBg>
                  )}
                  {item.symbol && (
                    <CircleBg>
                      <Typography weight="bold" variant="h4">
                        {item.symbol}
                      </Typography>
                    </CircleBg>
                  )}
                  {item && !item.icon && !item.symbol && '#'}
                  {item.keyword}
                </Chip>
              ))}
        </List>
      </Box>
      <Gap
        height={8}
        customStyle={{
          width: 'calc(100% + 40px)',
          margin: '0 -20px'
        }}
      />
    </>
  );
}

const List = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  column-gap: 6px;
  padding: 20px 20px 0;
  overflow-x: auto;
`;

const CircleBg = styled.div`
  width: 24px;
  height: 24px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg02};
  border-radius: 50%;
  margin-right: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default ProductInActiveCard;
