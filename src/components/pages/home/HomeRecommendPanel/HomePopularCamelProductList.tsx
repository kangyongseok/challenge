import { useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Chip, Flexbox, Icon, Label, Typography, useTheme } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';

import { NewProductListCard, NewProductListCardSkeleton } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { fetchCamelProducts } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { homePopularCamelProductListPrevPageState } from '@recoil/home';

function HomePopularCamelProductList() {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [prevPave, setPrevPageState] = useRecoilState(homePopularCamelProductListPrevPageState);

  const [page, setPage] = useState(prevPave);
  const [totalPages, setTotalPages] = useState(1);
  const [rowCount] = useState(3);

  const {
    data: { content = [] } = {},
    isInitialLoading,
    isFetched
  } = useQuery(
    queryKeys.products.camelProducts({
      order: 'popularDesc'
    }),
    () =>
      fetchCamelProducts({
        order: 'popularDesc'
      })
  );

  const handleClickPrev = () => {
    logEvent(attrKeys.home.CLICK_REFRESH_PRODUCT, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.PERSONAL_GUIDE
    });

    setPage((prevState) => {
      const newPage = prevState - 1;

      if (newPage < 0) {
        return totalPages - 1;
      }
      return newPage;
    });
  };

  const handleClickNext = () => {
    logEvent(attrKeys.home.CLICK_REFRESH_PRODUCT, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.PERSONAL_GUIDE
    });

    setPage((prevState) => {
      const newPage = prevState + 1;

      if (newPage >= totalPages) {
        return 0;
      }
      return newPage;
    });
  };

  useEffect(() => {
    if (isFetched) {
      const newTotalPages = Math.floor(
        content.length % rowCount === 0 ? content.length / rowCount : content.length / rowCount + 1
      );
      setTotalPages(newTotalPages > 4 ? 4 : newTotalPages);
    }
  }, [content, rowCount, isFetched]);

  useEffect(() => {
    const handleRouteChangeStart = () => setPrevPageState(page);

    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [setPrevPageState, router, page]);

  return (
    <Box
      component="section"
      customStyle={{
        padding: '32px 20px'
      }}
    >
      <Typography variant="h3" weight="bold">
        카멜에서 가장 인기가 많아요!
      </Typography>
      <Flexbox
        direction="vertical"
        gap={20}
        customStyle={{
          marginTop: 20
        }}
      >
        {isInitialLoading && (
          <>
            <NewProductListCardSkeleton />
            <NewProductListCardSkeleton />
            <NewProductListCardSkeleton />
          </>
        )}
        {!isInitialLoading &&
          content.slice(page * rowCount, page * rowCount + rowCount).map((product) => {
            const discountPercentage = +(100 - (product.scorePriceRate || 0)).toFixed();
            return (
              <NewProductListCard
                key={`home-popular-camel-product-${product.id}`}
                product={product}
                camelAuthLabelType="B"
                hideAreaInfo
                bottomLabel={
                  discountPercentage > 0 ? (
                    <Label
                      variant="ghost"
                      brandColor="red"
                      size="xsmall"
                      text={`실거래가 대비 ${discountPercentage}% 저렴해요!`}
                    />
                  ) : (
                    <Label
                      variant="ghost"
                      brandColor="gray"
                      size="xsmall"
                      text={`오늘 ${product.viewCount}번 조회`}
                      customStyle={{
                        display: product.viewCount < 5 ? 'none' : undefined
                      }}
                    />
                  )
                }
                attributes={{
                  name: attrProperty.name.MAIN,
                  title: attrProperty.title.CAMEL_POPULAR,
                  source: `${attrProperty.name.MAIN}_${attrProperty.title.CAMEL_POPULAR}`
                }}
              />
            );
          })}
      </Flexbox>
      <Flexbox
        alignment="center"
        customStyle={{
          width: 'fit-content',
          margin: '20px auto 0'
        }}
      >
        <Chip
          size="large"
          startIcon={<Icon name="Arrow2LeftOutlined" />}
          iconOnly
          onClick={handleClickPrev}
          disabled={isInitialLoading}
        />
        <Typography
          variant="body1"
          weight="medium"
          customStyle={{
            margin: '0 20px',
            '& > span': {
              color: common.ui80
            }
          }}
        >
          {page + 1} <span>/ {totalPages}</span>
        </Typography>
        <Chip
          size="large"
          startIcon={<Icon name="Arrow2RightOutlined" />}
          iconOnly
          onClick={handleClickNext}
          disabled={isInitialLoading}
        />
      </Flexbox>
    </Box>
  );
}

export default HomePopularCamelProductList;
