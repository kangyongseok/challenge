import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Box, Button, Flexbox, Icon, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { NewProductGridCard, NewProductGridCardSkeleton } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { fetchUserHistory } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { searchTabPanelsSwiperThresholdState } from '@recoil/search';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function RecentProductList() {
  const router = useRouter();

  const setSearchTabPanelsSwiperThresholdState = useSetRecoilState(
    searchTabPanelsSwiperThresholdState
  );

  const { data: accessUser } = useQueryAccessUser();

  const { data: { content = [] } = {}, isInitialLoading } = useQuery(
    queryKeys.users.userHistory('recommendWishes'),
    () => fetchUserHistory({ page: 0, size: 12, type: 'PV' }),
    {
      enabled: !!accessUser,
      refetchOnMount: true
    }
  );

  const handleClick = () => {
    logEvent(attrKeys.search.CLICK_RECENT_LIST, {
      name: attrProperty.name.SEARCH_MODAL
    });

    router.push({
      pathname: '/wishes',
      query: {
        tab: 'history'
      }
    });
  };

  if (!accessUser || (!isInitialLoading && !content.length)) return null;

  return (
    <Box
      component="section"
      customStyle={{
        marginTop: 12
      }}
    >
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        gap={2}
        customStyle={{
          padding: '20px 20px 0'
        }}
      >
        <Typography variant="h3" weight="bold">
          최근 본 매물
        </Typography>
        <Button
          variant="inline"
          size="small"
          brandColor="black"
          endIcon={<Icon name="Arrow2RightOutlined" color="ui60" />}
          disablePadding
          onClick={handleClick}
          customStyle={{
            gap: 0
          }}
        >
          전체보기
        </Button>
      </Flexbox>
      <List
        onTouchStart={() => setSearchTabPanelsSwiperThresholdState(1000)}
        onTouchEnd={() => setSearchTabPanelsSwiperThresholdState(5)}
      >
        {isInitialLoading &&
          Array.from({ length: 8 })
            .map((_, index) => index)
            .map((index) => (
              <NewProductGridCardSkeleton
                key={`search-recent-product-skeleton-${index}`}
                variant="swipeX"
              />
            ))}
        {!isInitialLoading &&
          content.map(({ product }) => (
            <NewProductGridCard
              key={`search-recent-product-${product.id}`}
              variant="swipeX"
              product={product}
              attributes={{
                name: attrProperty.name.SEARCH_MODAL,
                title: attrProperty.title.RECENT
              }}
            />
          ))}
      </List>
    </Box>
  );
}

const List = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 120px;
  column-gap: 12px;
  padding: 20px;
  overflow-x: auto;
`;

export default RecentProductList;
