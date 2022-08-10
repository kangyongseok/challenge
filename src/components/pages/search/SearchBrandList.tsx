import { Flexbox, Typography } from 'mrcamel-ui';

import { BrandList } from '@components/UI/organisms';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function SearchBrandList() {
  const { data: accessUser } = useQueryAccessUser();

  const handleClickBrand = ({
    id: _id,
    name,
    callback
  }: {
    id: number;
    name: string;
    callback: () => void;
  }) => {
    logEvent(attrKeys.search.CLICK_MAIN_BUTTON, {
      name: attrProperty.productName.SEARCHMODAL,
      title: attrProperty.productTitle.BRAND,
      att: name
    });
    callback();
  };

  return (
    <Flexbox component="section" direction="vertical" gap={12} customStyle={{ marginTop: 60 }}>
      <Typography variant="h4" weight="bold" customStyle={{ padding: '0 20px' }}>
        {accessUser ? '자주 찾는 브랜드' : '인기 브랜드'}
      </Typography>
      <BrandList variant="outlined" onClickBrand={handleClickBrand} />
    </Flexbox>
  );
}

export default SearchBrandList;
