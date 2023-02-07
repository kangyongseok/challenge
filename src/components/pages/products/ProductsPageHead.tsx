import { useMemo } from 'react';

import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';

import PageHead from '@components/UI/atoms/PageHead';

import type { SearchParams } from '@dto/product';

import { fetchSearchMeta } from '@api/product';

import queryKeys from '@constants/queryKeys';

import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber } from '@utils/common';

import type { ProductsVariant } from '@typings/products';

interface ProductsPageHeadProps {
  variant: ProductsVariant;
  params: Partial<SearchParams>;
}

function getClothesPartNameByKeyword(keyword: string) {
  if (keyword === '상의') {
    return 'top';
  }
  if (keyword === '하의') {
    return 'bottom';
  }
  if (keyword === '아우터') {
    return 'outer';
  }
  if (keyword === '원피스') {
    return 'onepiece';
  }
  if (keyword === '기타의류') {
    return 'clothes';
  }
  if (keyword === '신발') {
    return 'shoes';
  }
  if (keyword === '지갑') {
    return 'wallet';
  }
  if (keyword === '가방') {
    return 'bag';
  }
  if (keyword === '악세서리') {
    return 'acc';
  }
  if (keyword === '잡화') {
    return 'etc';
  }
  if (keyword === '캥핑') {
    return 'camping';
  }
  return '';
}

function ProductsPageHead({ variant, params }: ProductsPageHeadProps) {
  const router = useRouter();
  const { keyword }: { keyword?: string } = router.query;
  const {
    data: { productTotal = 0, baseSearchOptions: { minPrice = 0, idFilters = [] } = {} } = {}
  } = useQuery(queryKeys.products.searchMeta(params), () => fetchSearchMeta(params), {
    keepPreviousData: true,
    enabled: Object.keys(params).length > 0,
    staleTime: 5 * 60 * 1000
  });

  const pageKeyword = useMemo(() => {
    if (variant === 'brands') {
      return (keyword || '').split('-').join(' X ');
    }
    return (keyword || '').replace(/-/g, ' ');
  }, [variant, keyword]);
  const ogImage = useMemo(() => {
    if (variant === 'categories' && params.genders) {
      const name = getClothesPartNameByKeyword(keyword || '');
      if (name)
        return `https://${process.env.IMAGE_DOMAIN}/assets/images/seo/${name}-${params.genders}.webp`;
    }
    return `https://${process.env.IMAGE_DOMAIN}/assets/images/seo/products.webp`;
  }, [variant, keyword, params]);

  if (variant === 'search') {
    return (
      <PageHead
        title={`${pageKeyword} - 대한민국 전체 중고명품 매물 총 ${commaNumber(
          productTotal
        )}개 | 카멜`}
        description={`중고 ${pageKeyword} 최저가 ${commaNumber(
          getTenThousandUnitPrice(minPrice)
        )}만원, 새상품급 ${pageKeyword} ${commaNumber(
          (idFilters.find(({ name }) => name === '10') || {}).count || 0
        )}개! 카멜이 대한민국 모든 중고명품 매물 다 모았으니 꼭 꿀매물 득템할 수 있을 거예요.`}
        ogTitle={`${pageKeyword} - 대한민국 전체 중고명품 매물 총 ${commaNumber(
          productTotal
        )}개 | 카멜`}
        ogDescription={`중고 ${pageKeyword} 최저가 ${commaNumber(
          getTenThousandUnitPrice(minPrice)
        )}만원, 새상품급 ${pageKeyword} ${commaNumber(
          (idFilters.find(({ name }) => name === '10') || {}).count || 0
        )}개! 카멜이 대한민국 모든 중고명품 매물 다 모았으니 꼭 꿀매물 득템할 수 있을 거예요.`}
        ogImage={ogImage}
        keywords={`중고 ${pageKeyword}, 중고 ${pageKeyword} 모음, 중고 ${pageKeyword} 매물, ${pageKeyword} 중고, ${pageKeyword} 중고 매물, ${pageKeyword} 최저가, 빈티지 ${pageKeyword}, 세컨핸드 ${pageKeyword} , 여자 ${pageKeyword}, 남자 ${pageKeyword}, ${pageKeyword}`}
      />
    );
  }

  if (variant === 'categories') {
    return (
      <PageHead
        title={`중고명품 ${pageKeyword} - 대한민국 전체 중고명품 매물 총 ${commaNumber(
          productTotal
        )}개 | 카멜`}
        description={`중고명품 ${pageKeyword} 최저가 ${commaNumber(
          getTenThousandUnitPrice(minPrice)
        )}만원, 새상품급 ${pageKeyword} ${commaNumber(
          (idFilters.find(({ name }) => name === '10') || {}).count || 0
        )}개! 카멜이 대한민국 모든 중고명품 매물 다 모았으니 꼭 꿀매물 득템할 수 있을 거예요.`}
        ogTitle={`중고명품 ${pageKeyword} - 대한민국 전체 중고명품 매물 총 ${commaNumber(
          productTotal
        )}개 | 카멜`}
        ogDescription={`중고명품 ${pageKeyword} 최저가 ${commaNumber(
          getTenThousandUnitPrice(minPrice)
        )}만원, 새상품급 ${pageKeyword} ${commaNumber(
          (idFilters.find(({ name }) => name === '10') || {}).count || 0
        )}개! 카멜이 대한민국 모든 중고명품 매물 다 모았으니 꼭 꿀매물 득템할 수 있을 거예요.`}
        ogImage={ogImage}
        keywords={`중고 ${pageKeyword}, 중고 ${pageKeyword} 모음, 중고 ${pageKeyword} 매물, ${pageKeyword} 중고, ${pageKeyword} 중고 매물, ${pageKeyword} 최저가, 새상품급 ${pageKeyword}, ${pageKeyword} 정품가품, 여자 ${pageKeyword}, 남자 ${pageKeyword}, ${pageKeyword}`}
      />
    );
  }

  if (variant === 'brands') {
    return (
      <PageHead
        title={`중고 ${pageKeyword} - 대한민국 전체 중고명품 매물 총 ${commaNumber(
          productTotal
        )}개 | 카멜`}
        description={`중고 ${pageKeyword} 최저가 ${commaNumber(
          getTenThousandUnitPrice(minPrice)
        )}만원, 새상품급 ${pageKeyword} ${commaNumber(
          (idFilters.find(({ name }) => name === '10') || {}).count || 0
        )}개! 카멜이 대한민국 모든 중고명품 매물 다 모았으니 꼭 꿀매물 득템할 수 있을 거예요.`}
        ogTitle={`중고명품 ${pageKeyword} - 대한민국 전체 중고명품 매물 총 ${commaNumber(
          productTotal
        )}개 | 카멜`}
        ogDescription={`중고명품 ${pageKeyword} 최저가 ${commaNumber(
          getTenThousandUnitPrice(minPrice)
        )}만원, 새상품급 ${pageKeyword} ${commaNumber(
          (idFilters.find(({ name }) => name === '10') || {}).count || 0
        )}개! 카멜이 대한민국 모든 중고명품 매물 다 모았으니 꼭 꿀매물 득템할 수 있을 거예요.`}
        ogImage={ogImage}
        keywords={`${pageKeyword},${pageKeyword} ${pageKeyword} 최저가, ${pageKeyword} 가격, 중고 ${pageKeyword}, 중고 ${pageKeyword} 가격, ${pageKeyword} 시세, ${pageKeyword} 시세 조회`}
      />
    );
  }

  return (
    <PageHead
      title="전국 중고명품 통합검색은 카멜에서"
      description="여러분은 카멜에서 검색만 하세요. 전국 중고명품 매물은 카멜이 다 모아서 비교하고 분석해드릴게요!"
      ogTitle="전국 중고명품 통합검색은 카멜에서"
      ogDescription="여러분은 카멜에서 검색만 하세요. 전국 중고명품 매물은 카멜이 다 모아서 비교하고 분석해드릴게요!"
      ogImage={`https://${process.env.IMAGE_DOMAIN}/assets/images/seo/main.webp`}
      keywords="중고 명품, 빈티지 명품, 구찌, 샤넬, 루이비통, 보테가베네타, 톰브라운, 명품 중고, 중고 샤넬, 중고 루이비통, 중고 구찌, 중고 톰브라운, 중고 보테가베네타"
    />
  );
}

export default ProductsPageHead;
