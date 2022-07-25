import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import { useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Icon, Label, Toast, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Skeleton } from '@components/UI/atoms';

import type { ProductKeywordsContent } from '@dto/user';
import type { SearchParams } from '@dto/product';

import { logEvent } from '@library/amplitude';

import {
  deleteProductKeyword,
  fetchProductKeywords,
  putProductKeyword,
  putProductKeywordView
} from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function SaveSearchList({ page = 'MAIN' }) {
  const {
    theme: { palette, box }
  } = useTheme();
  const [deleteToast, setDeleteToast] = useState(false);
  const [rollbackToast, setRollbackToast] = useState(false);
  const [deletedId, setDeletedId] = useState<number>(0);

  const { data: accessUser } = useQueryAccessUser();
  const {
    data: { content: productKeywords = [] } = {},
    isLoading,
    refetch
  } = useQuery(queryKeys.users.userProductKeywords(), fetchProductKeywords, {
    refetchOnMount: true,
    enabled: !!accessUser
  });
  const { mutate } = useMutation(deleteProductKeyword);
  const { mutate: productKeywordRestoreMutate } = useMutation(putProductKeyword);
  const { mutate: productKeywordViewMutate } = useMutation(putProductKeywordView);
  const router = useRouter();

  useEffect(() => {
    if (productKeywords.length) {
      const newProductKeywords = productKeywords.filter(({ isNew }) => isNew);
      if (newProductKeywords.length > 0) {
        logEvent(attrKeys.saveSearch.VIEW_MYLIST, {
          name: page,
          att: 'LIST'
        });
      }
    }
  }, [page, productKeywords]);

  const handleClickDelete = (e: MouseEvent<HTMLOrSVGElement>) => {
    const target = e.currentTarget;
    logEvent(attrKeys.saveSearch.CLICK_MYLIST, {
      name: page,
      att: 'DELETE'
    });
    setDeletedId(Number(target.dataset.cardId));
    mutate(Number(target.dataset.cardId), {
      onSuccess: () => {
        refetch();
        setRollbackToast(false);
        setDeleteToast(true);
      }
    });
  };

  const handleClickRollback = () => {
    logEvent(attrKeys.saveSearch.CLICK_UNDO, {
      name: page,
      title: 'MYLIST_DELETE'
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

      if (clickProductKeywords && clickProductKeywords.isNew) {
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

  const handleClickFilterProduct = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const findItem = productKeywords.find(({ id }) => id === Number(target.dataset.cardId || 0));

    logEvent(attrKeys.saveSearch.CLICK_PRODUCT_LIST, {
      name: page,
      title: 'MYLIST'
    });

    if (findItem) {
      setHistoryState(findItem, Number(target.dataset.cardId));
    }
  };

  if (!accessUser) return null;

  if (isLoading)
    return (
      <Box
        customStyle={{
          marginTop: page === 'SEARCH' ? '24px' : '40px',
          position: 'relative'
        }}
      >
        <Skeleton
          width="138px"
          height="21px"
          disableAspectRatio
          customStyle={{
            borderRadius: box.round['4']
          }}
        />
        <SaveSearchCardArea>
          <Skeleton
            width="298px"
            height="89px"
            disableAspectRatio
            customStyle={{ borderRadius: box.round['8'] }}
          />
          <Skeleton
            width="298px"
            height="89px"
            disableAspectRatio
            customStyle={{ borderRadius: box.round['8'] }}
          />
        </SaveSearchCardArea>
      </Box>
    );

  if (!isLoading && !productKeywords.length) return null;

  return (
    <Box
      customStyle={{
        marginTop: page === 'SEARCH' ? '24px' : '40px',
        position: 'relative'
      }}
    >
      <Title weight="bold" variant="h4">
        저장한 검색 바로보기
      </Title>
      <SaveSearchCardArea>
        {productKeywords.map((card) => (
          <SaveSearchCard key={`save-search-card-${card.id}`} isImage={card.images.length > 0}>
            <Flexbox
              gap={22}
              alignment="center"
              data-card-id={card.id}
              onClick={handleClickFilterProduct}
            >
              {card.isNew && (
                <Box customStyle={{ position: 'relative', minWidth: 56, height: 56 }}>
                  {card.images.map((src, i) => (
                    <NewImg
                      key={`save-search-${src}`}
                      src={src}
                      alt={card.keyword}
                      indexZero={i === 0}
                    />
                  ))}
                  <NewLabel text="NEW" variant="contained" />
                </Box>
              )}
              <Flexbox
                direction="vertical"
                customStyle={{
                  flexGrow: 1,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis'
                }}
              >
                <Flexbox alignment="center" gap={6}>
                  <CardLabel variant="contained" text="키워드" />
                  <FilterText weight="medium">{card.keyword.replace('(P)', '')}</FilterText>
                </Flexbox>
                <Divider />
                <Flexbox
                  alignment="center"
                  gap={6}
                  customStyle={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis'
                  }}
                >
                  <CardLabel variant="contained" text="필터" />
                  <FilterText variant="small1">{card.filter}</FilterText>
                </Flexbox>
              </Flexbox>
            </Flexbox>
            <Icon
              name="CloseOutlined"
              customStyle={{ position: 'absolute', top: 5, right: 5, color: '#E6E6E6' }}
              size="small"
              onClick={handleClickDelete}
              data-card-id={card.id}
            />
          </SaveSearchCard>
        ))}
      </SaveSearchCardArea>
      <Toast open={deleteToast} onClose={() => setDeleteToast(false)} autoHideDuration={4000}>
        <Flexbox justifyContent="space-between" alignment="center" gap={8}>
          <Typography
            weight="medium"
            customStyle={{ flexGrow: 1, color: palette.common.white, textAlign: 'left' }}
          >
            저장한 매물목록이 삭제되었습니다.
          </Typography>
          <RollbackButton variant="contained" onClick={handleClickRollback}>
            되돌리기
          </RollbackButton>
        </Flexbox>
      </Toast>
      <Toast open={rollbackToast} onClose={() => setRollbackToast(false)}>
        <Typography weight="medium" customStyle={{ color: palette.common.white }}>
          삭제한 매물목록을 다시 저장했어요.
        </Typography>
      </Toast>
    </Box>
  );
}

const NewImg = styled.img<{ indexZero: boolean }>`
  position: absolute;
  top: ${({ indexZero }) => (indexZero ? 0 : 5)}px;
  left: ${({ indexZero }) => (indexZero ? 0 : 6)}px;
  display: block;
  width: 56px;
  height: 56px;
  z-index: ${({ indexZero }) => (indexZero ? 2 : 1)};
`;

const NewLabel = styled(Label)`
  position: absolute;
  top: -8px;
  right: -14px;
  width: 31px;
  height: 19px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.palette.secondary.red.highlight};
  color: ${({ theme }) => theme.palette.secondary.red.main};
  z-index: 3;
  font-weight: ${({ theme }) => theme.typography.small2.weight.bold};
  font-size: ${({ theme }) => theme.typography.small2.size};
`;

const FilterText = styled(Typography)`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const SaveSearchCardArea = styled.section`
  width: calc(100% + 40px);
  padding: 16px 20px;
  margin: 0 -20px;
  overflow-x: auto;
  white-space: nowrap;
  & > div {
    display: inline-block;
    margin-right: 12px;
    &:last-child {
      margin-right: 0;
    }
  }
`;

const SaveSearchCard = styled.div<{ isImage: boolean }>`
  display: inline-block;
  min-width: ${({ isImage }) => (isImage ? 298 : 228)}px;
  max-width: ${({ isImage }) => (isImage ? 298 : 228)}px;
  min-height: 89px;
  max-height: 89px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.white};
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.grey['90']};
  box-shadow: ${({
    theme: {
      box: { shadow }
    }
  }) => shadow.modal};
  border-radius: 8px;
  padding: ${({ isImage }) => (isImage ? '16px' : '17px 24px')};
  position: relative;
  cursor: pointer;
  vertical-align: bottom;
`;

const CardLabel = styled(Label)`
  padding: 2px 4px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.grey['95']};
  border-radius: 4px;
  font-weight: ${({
    theme: {
      typography: { small2 }
    }
  }) => small2.weight};
  font-size: ${({
    theme: {
      typography: { small2 }
    }
  }) => small2.size};
  line-height: 15px;
  color: #666666;
  height: 20px;
`;

const Title = styled(Typography)`
  line-height: 24px;
  letter-spacing: -0.2px;
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.grey['20']};
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
  }) => common.white};
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  margin: 8px 0 7px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.grey['90']};
`;

export default SaveSearchList;
