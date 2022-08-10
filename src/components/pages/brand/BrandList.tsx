import type { MutableRefObject } from 'react';
import { Fragment } from 'react';

import { Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import BrandItem from '@components/pages/brand/BrandItem';

import type { AllBrand } from '@dto/brand';

import { parseWordToConsonant } from '@utils/brands';

import { koRegexp } from '@pages/brand';

interface BrandListProps {
  brandsTitleList: string[];
  brandsList: AllBrand[];
  brandNavRef: MutableRefObject<HTMLDivElement[]>;
}

function BrandList({ brandsTitleList, brandsList, brandNavRef }: BrandListProps) {
  return (
    <Wrapper>
      {brandsTitleList.map((brandsTitle, index) => (
        <Fragment key={`brand-title-${brandsTitle}`}>
          <BrandNav
            ref={(ref) => {
              // eslint-disable-next-line no-param-reassign
              if (ref) brandNavRef.current[index] = ref;
            }}
            variant="h1"
            weight="bold"
            customStyle={{ padding: '32px 0 12px' }}
          >
            {brandsTitle.split(', ')[0]}
          </BrandNav>
          {brandsList
            .filter((brand) => {
              const brandParseWordToConsonant = parseWordToConsonant(brand.name[0]);

              return brandsTitle === '기타'
                ? koRegexp.test(brandParseWordToConsonant)
                : brandsTitle.split(', ').includes(brandParseWordToConsonant);
            })
            .map((brand) => (
              <BrandItem key={`brand-all-list-${brand.name}`} type="recommend" brand={brand} />
            ))}
        </Fragment>
      ))}
    </Wrapper>
  );
}

const Wrapper = styled.section`
  display: flex;
  gap: 8px;
  flex-direction: column;
  padding: 0 40px 20px 20px;
  user-select: none;
`;

const BrandNav = styled(Typography)`
  font-size: 32px;
  line-height: 42px;
`;

export default BrandList;
