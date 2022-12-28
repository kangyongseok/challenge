import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import { useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Flexbox,
  Icon,
  Label,
  Skeleton,
  Toast,
  Typography,
  useTheme
} from 'mrcamel-ui';
import styled from '@emotion/styled';

import type { ProductKeywordsContent } from '@dto/user';
import type { SearchParams } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import {
  deleteProductKeyword,
  fetchProductKeywords,
  putProductKeyword,
  putProductKeywordView
} from '@api/user';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function SearchProductsKeywordList() {
  const {
    theme: { palette }
  } = useTheme();
  const [deleteToast, setDeleteToast] = useState(false);
  const [rollbackToast, setRollbackToast] = useState(false);
  const [deletedId, setDeletedId] = useState<number>(0);

  const { data: accessUser } = useQueryAccessUser();
  const {
    data: { content: productKeywords = [] } = {},
    isLoading,
    isFetched,
    refetch
  } = useQuery(queryKeys.users.userProductKeywords(), fetchProductKeywords, {
    refetchOnMount: true,
    enabled: !!accessUser,
    onSuccess(data) {
      const newProducts = data.content.filter((product) => product.isNew);
      const generalProducts = data.content.filter((product) => !product.isNew);

      logEvent(attrKeys.search.LOAD_MYLIST, {
        name: attrProperty.productName.SEARCH,
        title: attrProperty.productTitle.MYLIST,
        total: data.content.length,
        totalIds: data.content.map((product) => product.id),
        new: newProducts.length,
        newIds: newProducts.map((product) => product.id),
        general: generalProducts.length,
        generalIds: generalProducts.map((product) => product.id)
      });
    }
  });
  const { mutate } = useMutation(deleteProductKeyword);
  const { mutate: productKeywordRestoreMutate } = useMutation(putProductKeyword);
  const { mutate: productKeywordViewMutate } = useMutation(putProductKeywordView);
  const router = useRouter();

  const handleClickDelete = (cardId: number) => (e: MouseEvent<HTMLOrSVGElement>) => {
    e.stopPropagation();

    logEvent(attrKeys.productsKeyword.CLICK_MYLIST, {
      name: attrProperty.productName.SEARCH,
      att: 'DELETE'
    });
    setDeletedId(Number(cardId));
    mutate(Number(cardId), {
      onSuccess: () => {
        refetch();
        setRollbackToast(false);
        setDeleteToast(true);
      }
    });
  };

  const handleClickRollback = () => {
    logEvent(attrKeys.productsKeyword.CLICK_UNDO, {
      name: attrProperty.productName.SEARCH,
      title: attrProperty.productTitle.MYLIST_DELETE
    });
    productKeywordRestoreMutate(deletedId, {
      onSuccess: () => {
        refetch();
        setDeleteToast(false);
        setRollbackToast(true);
        setDeletedId(0);
      }
    });
  };

  const setHistoryState = (currentProductKeyword: ProductKeywordsContent, id: number) => {
    const searchParams: SearchParams = JSON.parse(currentProductKeyword.keywordFilterJson);

    if (currentProductKeyword) {
      const getViewType = () => {
        if (currentProductKeyword.sourceType === 3) {
          return 'categories';
        }

        if (currentProductKeyword.sourceType === 1 || currentProductKeyword.sourceType === 2) {
          return 'brands';
        }

        return 'search';
      };
      const getKeywordByViewType = (viewType: string) => {
        if (viewType === 'categories') {
          return searchParams.categories;
        }
        if (viewType === 'brands') {
          return searchParams.requiredBrands;
        }
        return searchParams.keyword;
      };

      const viewType = getViewType();
      const keyword = getKeywordByViewType(viewType);

      const clickProductKeywords = productKeywords.find((item) => item.id === id);

      if (clickProductKeywords) {
        SessionStorage.set(sessionStorageKeys.productsEventProperties, {
          name: attrProperty.productName.SEARCH,
          title: attrProperty.productTitle.MYLIST,
          type: attrProperty.productType.INPUT,
          keyword: clickProductKeywords.keyword,
          filters: clickProductKeywords.keywordFilterJson
        });
      }

      if (clickProductKeywords?.isNew) {
        productKeywordViewMutate(id, {
          onSettled: () =>
            router.push({
              pathname: `/products/${viewType}/${encodeURIComponent(String(keyword))}`,
              query: { ...searchParams }
            })
        });
      } else {
        router.push({
          pathname: `/products/${viewType}/${encodeURIComponent(String(keyword))}`,
          query: { ...searchParams }
        });
      }
    }
  };

  const handleClickFilterProduct = (cardId: number) => () => {
    const product = productKeywords.find(({ id }) => id === cardId);

    if (product) {
      logEvent(attrKeys.productsKeyword.CLICK_PRODUCT_LIST, {
        name: attrProperty.productName.SEARCH,
        title: attrProperty.productTitle.MYLIST,
        att: product.isNew ? 'NEW' : 'GENERAL'
      });
      setHistoryState(product, Number(cardId));
    }
  };

  useEffect(() => {
    logEvent(attrKeys.productsKeyword.VIEW_MYLIST, { name: attrProperty.productName.SEARCH });
  }, []);

  return !!accessUser && (isLoading || (isFetched && productKeywords.length > 0)) ? (
    <>
      <Flexbox component="section" direction="vertical" gap={12} customStyle={{ marginTop: 52 }}>
        <Typography variant="h4" weight="bold" customStyle={{ padding: '0 20px' }}>
          저장한 검색목록
        </Typography>
        <Box customStyle={{ overflowX: 'auto', width: '100%' }}>
          <CardList>
            {isLoading
              ? Array.from({ length: 5 }, (_, index) => (
                  <Box key={`saved-products-skeleton-${index}`}>
                    <Skeleton width={300} height={78} round={8} disableAspectRatio />
                  </Box>
                ))
              : productKeywords.map((card) => (
                  <Card
                    key={`saved-products-keyword-${card.id}`}
                    hasImage={card.images.length > 0}
                    onClick={handleClickFilterProduct(card.id)}
                  >
                    <Flexbox gap={20} alignment="center">
                      {card.isNew && (
                        <Box
                          customStyle={{
                            position: 'relative',
                            minWidth: 40 + card.images.slice(0, 3).length * 16,
                            height: 56
                          }}
                        >
                          {card.images.slice(0, 3).map((src, index) => (
                            <ProductImage
                              key={`saved-products-image-${src}`}
                              src={src}
                              alt={card.keyword}
                              index={index}
                            />
                          ))}
                          <NewLabel text="NEW" variant="solid" brandColor="primary" size="xsmall" />
                        </Box>
                      )}
                      <Flexbox
                        direction="vertical"
                        gap={2}
                        customStyle={{ width: card.images.length > 0 ? 152 : 160 }}
                      >
                        <Text weight="medium">{card.keyword.replace('(P)', '')}</Text>
                        <Text variant="small1">{card.filter}</Text>
                      </Flexbox>
                    </Flexbox>
                    <CloseIcon>
                      <Icon
                        name="CloseOutlined"
                        width={15}
                        height={15}
                        customStyle={{ marginTop: -13, color: palette.common.ui80 }}
                        onClick={handleClickDelete(card.id)}
                      />
                    </CloseIcon>
                  </Card>
                ))}
          </CardList>
        </Box>
      </Flexbox>
      <Toast open={deleteToast} onClose={() => setDeleteToast(false)} autoHideDuration={4000}>
        <Flexbox justifyContent="space-between" alignment="center" gap={8}>
          <Typography
            weight="medium"
            customStyle={{ flexGrow: 1, color: palette.common.uiWhite, textAlign: 'left' }}
          >
            저장한 매물목록이 삭제되었습니다.
          </Typography>
          <RollbackButton variant="solid" onClick={handleClickRollback}>
            되돌리기
          </RollbackButton>
        </Flexbox>
      </Toast>
      <Toast open={rollbackToast} onClose={() => setRollbackToast(false)}>
        <Typography weight="medium" customStyle={{ color: palette.common.uiWhite }}>
          삭제한 매물목록을 다시 저장했어요.
        </Typography>
      </Toast>
    </>
  ) : null;
}

const CardList = styled.section`
  display: flex;
  column-gap: 12px;
  padding: 0 20px;
  user-select: none;
  width: fit-content;
`;

const Card = styled.div<{ hasImage: boolean }>`
  display: inline-block;
  position: relative;
  background-color: ${({ theme: { palette } }) => palette.common.ui95};
  border-radius: 8px;
  padding: ${({ hasImage }) => (hasImage ? '11px 20px' : '20px')};
  height: fit-content;
  max-width: 300px;
  cursor: pointer;
`;

const ProductImage = styled.img<{ index: number }>`
  position: absolute;
  display: block;
  width: 56px;
  height: 56px;
  border: 1px solid ${({ theme: { palette } }) => palette.common.ui95};
  border-radius: 50%;
  left: ${({ index }) => index * 16}px;
  order: ${({ index }) => index + 1};
  z-index: ${({ index }) => 3 - index};
`;

const NewLabel = styled(Label)`
  position: absolute;
  top: 0;
  right: 0;
  width: 31px;
  height: 19px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
`;

const CloseIcon = styled.button`
  position: absolute;
  padding: 8px 8px 0 0;
  width: 23px;
  height: 23px;
  top: 0;
  right: 0;
  z-index: 1;
`;

const Text = styled(Typography)`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const RollbackButton = styled(Button)`
  background: none;
  padding: 0;
  height: auto;
  text-decoration: underline;
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
`;

export default SearchProductsKeywordList;
