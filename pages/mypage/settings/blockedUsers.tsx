/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { MouseEvent } from 'react';
import { useCallback, useEffect, useMemo } from 'react';

import { AutoSizer, InfiniteLoader, List, WindowScroller } from 'react-virtualized';
import type { Index, ListRowProps } from 'react-virtualized';
import type { GetServerSidePropsContext } from 'next';
import dayjs from 'dayjs';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { Button, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import UserListSkeleton from '@components/UI/molecules/Skeletons/UserListSkeleton';
import Header from '@components/UI/molecules/Header';
import ListItem from '@components/UI/atoms/ListItem';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchBlocks } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';

import useMutationUserBlock from '@hooks/useMutationUserBlock';

function BlockedUsers() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const toastStack = useToastStack();

  const {
    unblock: { mutate: mutateUnblock, isLoading: isLoadingMutateUnblock }
  } = useMutationUserBlock();

  const params = useMemo(() => ({ size: 20 }), []);
  const {
    data: { pages = [] } = {},
    isLoading,
    isFetched,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch
  } = useInfiniteQuery(
    queryKeys.users.blocks(params),
    ({ pageParam = 0 }) => fetchBlocks({ ...params, page: pageParam }),
    {
      refetchOnMount: true,
      getNextPageParam: (nextData) => {
        const { number = 0, totalPages = 0 } = nextData || {};

        return number < totalPages - 1 ? number + 1 : undefined;
      }
    }
  );

  const blockUsers = useMemo(
    () => pages.flatMap(({ content }) => content).filter((blockUser) => !!blockUser),
    [pages]
  );

  const loadMoreRows = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;

    await fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleClickUnblockUser = useCallback(
    (userId: number, userName: string) => async (e: MouseEvent<HTMLButtonElement>) => {
      if (isLoadingMutateUnblock) return;

      logEvent(attrKeys.mypage.CLICK_BLOCKUSER, {
        name: attrProperty.name.BLOCK_LIST,
        att: 'CANCEL'
      });

      e.stopPropagation();
      await mutateUnblock(userId, {
        onSuccess() {
          toastStack({
            children: `${userName}님을 차단 해제했어요.`
          });
          refetch();
        }
      });
    },
    [isLoadingMutateUnblock, mutateUnblock, refetch, toastStack]
  );

  const rowRenderer = useCallback(
    ({ key, index, style }: ListRowProps) => {
      const blockedUser = blockUsers[index];

      return blockedUser ? (
        <div key={key} style={style}>
          <ListItem
            avatarUrl={blockedUser.targetUser.image}
            title={blockedUser.targetUser.name}
            description={dayjs(blockedUser.dateCreated).format('MM월 DD일 차단됨')}
            action={
              <Button
                variant="ghost"
                size="medium"
                brandColor="black"
                customStyle={{ width: 70, minWidth: 70 }}
                disabled={isLoadingMutateUnblock}
                onClick={handleClickUnblockUser(
                  blockedUser.targetUser.id,
                  blockedUser.targetUser.name
                )}
              >
                차단해제
              </Button>
            }
          />
        </div>
      ) : null;
    },
    [blockUsers, handleClickUnblockUser, isLoadingMutateUnblock]
  );

  useEffect(() => {
    logEvent(attrKeys.mypage.VIEW_BLOCK_LIST);
  }, []);

  return (
    <GeneralTemplate
      header={
        <Header
          showRight={false}
          customStyle={{ '& > div > div': { borderBottom: `1px solid ${common.line01}` } }}
        >
          <Typography variant="h3" weight="bold">
            차단 사용자 관리
          </Typography>
        </Header>
      }
      disablePadding
    >
      {isLoading || (isFetched && blockUsers.length > 0) ? (
        <BlockUserWrapper>
          {isLoading ? (
            Array.from({ length: 1 }, (_, index) => (
              <UserListSkeleton key={`block-user-skeleton-${index}`} />
            ))
          ) : (
            // @ts-ignore
            <InfiniteLoader
              isRowLoaded={({ index }: Index) => !!blockUsers[index]}
              loadMoreRows={loadMoreRows}
              rowCount={hasNextPage ? blockUsers.length + 1 : blockUsers.length}
            >
              {({ registerChild, onRowsRendered }) => (
                // @ts-ignore
                <WindowScroller>
                  {({ height, isScrolling, scrollTop, scrollLeft }) => (
                    // @ts-ignore
                    <AutoSizer disableHeight>
                      {({ width }) => (
                        // @ts-ignore
                        <List
                          ref={registerChild}
                          onRowsRendered={onRowsRendered}
                          width={width}
                          autoHeight
                          height={height}
                          rowCount={blockUsers.length}
                          rowHeight={76}
                          rowRenderer={rowRenderer}
                          scrollTop={scrollTop}
                          scrollLeft={scrollLeft}
                          isScrolling={isScrolling}
                        />
                      )}
                    </AutoSizer>
                  )}
                </WindowScroller>
              )}
            </InfiniteLoader>
          )}
        </BlockUserWrapper>
      ) : (
        <NoBlockUsers variant="h3" weight="bold">
          차단한 사용자가 없어요
        </NoBlockUsers>
      )}
    </GeneralTemplate>
  );
}

const NoBlockUsers = styled(Typography)`
  margin-top: 84px;
  text-align: center;
  color: ${({ theme: { palette } }) => palette.common.ui60};
  padding: 0 20px;
`;

const BlockUserWrapper = styled.ul`
  position: relative;
  list-style: none;
  margin: 0;
  padding: 12px 0;
`;

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  Initializer.initAccessTokenByCookies(getCookies({ req }));

  return {
    props: {}
  };
}

export default BlockedUsers;
