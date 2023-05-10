import { Flexbox } from '@mrcamelhub/camel-ui';

import BrandItem from '@components/pages/brand/BrandItem';

import type { AllBrand } from '@dto/brand';

interface BrandSuggestListProps {
  brandsList: AllBrand[];
}

function BrandSuggestList({ brandsList }: BrandSuggestListProps) {
  return (
    <Flexbox
      component="section"
      direction="vertical"
      gap={8}
      customStyle={{ flex: 1, padding: '8px 20px', userSelect: 'none' }}
    >
      {brandsList.map((brand) => (
        <BrandItem key={`brand-suggest-list-${brand.name}`} type="suggest" brand={brand} />
      ))}
    </Flexbox>
  );
}

export default BrandSuggestList;
