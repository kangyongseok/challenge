import { useMemo } from 'react';

import { useInfiniteQuery } from 'react-query';
import { useRouter } from 'next/router';

import PageHead from '@components/UI/atoms/PageHead';

import { fetchReviewInfo } from '@api/product';

import queryKeys from '@constants/queryKeys';

import { commaNumber } from '@utils/common';

function getScoreText(curnScore: string | null, maxScore: string | null) {
  if (!curnScore && !maxScore) {
    return '아직 평점이 없는 판매자에요.';
  }
  if (curnScore && Number.isNaN(Number(curnScore))) {
    return `매너온도 ${curnScore}인 판매자에요.`;
  }
  return `평점 ${maxScore}점 만점에 ${curnScore}점을 받은 판매자에요.`;
}

function SellerInfoPageHead() {
  const router = useRouter();
  const { id } = router.query;

  const params = {
    sellerId: Number(id || 0),
    size: 20
  };

  const { data: { pages = [] } = {} } = useInfiniteQuery(
    queryKeys.products.reviewInfo(params),
    async ({ pageParam = 0 }) => fetchReviewInfo({ ...params, page: pageParam }),
    {
      enabled: !!params.sellerId,
      getNextPageParam: (nextData) => {
        const { sellerReviews: { number = 0, totalPages = 0 } = {} } = nextData || {};

        return number < totalPages - 1 ? number + 1 : undefined;
      }
    }
  );

  const {
    name = '',
    curnScore = '',
    maxScore = '',
    reviewCount = 0,
    totalCount = 0
  } = useMemo(() => {
    const lastPage = pages[pages.length - 1] || {};

    return {
      ...lastPage.productSeller,
      curnScore: lastPage.curnScore,
      maxScore: lastPage.maxScore
    };
  }, [pages]);

  return (
    <PageHead
      title={`판매자 ${name || id} 후기와 평점 보기 | 카멜`}
      description={`${getScoreText(curnScore, maxScore)} 총 ${commaNumber(
        reviewCount
      )}개의 후기를 받았고, ${commaNumber(totalCount)}개의 매물을 팔고 있어요.`}
      ogTitle={`판매자 ${name || id} 후기와 평점 보기 | 카멜`}
      ogDescription={`${getScoreText(curnScore, maxScore)} 총 ${commaNumber(
        reviewCount
      )}개의 후기를 받았고, ${commaNumber(totalCount)}개의 매물을 팔고 있어요.`}
      ogImage={`https://${process.env.IMAGE_DOMAIN}/assets/images/seo/main.webp`}
    />
  );
}

export default SellerInfoPageHead;
