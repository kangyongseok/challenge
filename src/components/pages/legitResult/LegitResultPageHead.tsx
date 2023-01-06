import { useMemo } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';

import PageHead from '@components/UI/atoms/PageHead';

import { fetchProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';

import { commaNumber } from '@utils/common';

function LegitResultPageHead() {
  const router = useRouter();
  const { id } = router.query;
  const splitIds = String(id).split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);

  const {
    data: {
      legitOpinions = [],
      productResult: {
        quoteTitle = '',
        brand = { name: '', nameEng: '' },
        category = { name: '' },
        imageMain = '',
        imageThumbnail = '',
        photoGuideDetails = []
      } = {}
    } = {}
  } = useQuery(queryKeys.productLegits.legit(productId), () => fetchProductLegit(productId), {
    enabled: !!id
  });

  const { name, authenticCount, fakeCount, impossibleCount } = useMemo(
    () => ({
      name: quoteTitle || `${brand.name} ${category.name}`,
      authenticCount: legitOpinions.filter(({ result }) => result === 1).length,
      fakeCount: legitOpinions.filter(({ result }) => result === 2).length,
      impossibleCount: legitOpinions.filter(({ result }) => result === 3).length
    }),
    [quoteTitle, brand, category, legitOpinions]
  );

  return (
    <PageHead
      title={`${name} ${productId} ${commaNumber(
        authenticCount + fakeCount + impossibleCount
      )}개의 정품 가품 의견 확인하기 | 카멜`}
      description={`${name} 정품의견 ${commaNumber(authenticCount)}개, 가품의견 ${commaNumber(
        fakeCount
      )}개, 감정불가 ${impossibleCount}개, 총 ${commaNumber(
        authenticCount + fakeCount + impossibleCount
      )}개의 의견이 있어요! 오늘 사려는 그 명품, 중고라면 정품가품 의견 꼭 받아보세요.`}
      ogTitle={`${name} ${productId} ${commaNumber(
        authenticCount + fakeCount + impossibleCount
      )}개의 정품 가품 의견 확인하기 | 카멜`}
      ogDescription={`${name} 정품의견 ${commaNumber(authenticCount)}개, 가품의견 ${commaNumber(
        fakeCount
      )}개, 감정불가 ${impossibleCount}개, 총 ${commaNumber(
        authenticCount + fakeCount + impossibleCount
      )}개의 의견이 있어요! 오늘 사려는 그 명품, 중고라면 정품가품 의견 꼭 받아보세요.`}
      ogImage={imageMain || imageThumbnail || (photoGuideDetails[0] || {}).imageUrl}
      keywords={`중고 ${brand.name} 정품가품 구별, ${brand.name} 정품 가품 구별법, ${brand.name} 정품 가품 구분, ${brand.name} 정품 가품, ${brand.name} 가품, ${brand.name} 정품, ${name} 정품, ${name} 정품가품 구별, ${name} 정품가품 확인`}
    />
  );
}

export default LegitResultPageHead;
