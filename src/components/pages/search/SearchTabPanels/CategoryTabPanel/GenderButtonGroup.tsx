import { useEffect } from 'react';

import { useRecoilState } from 'recoil';
import { Button, Flexbox } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { searchCategoryState } from '@recoil/search';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';

function GenderButtonGroup() {
  const {
    palette: { common }
  } = useTheme();

  const [{ gender }, setSearchCategoryState] = useRecoilState(searchCategoryState);

  const { data: { info: { value: { gender: userGender = '' } = {} } = {} } = {}, isFetching } =
    useQueryMyUserInfo();

  const handleClick = (newGender: 'male' | 'female') => () => {
    logEvent(attrKeys.category.CLICK_CATEGORY_GENDER, {
      name: attrProperty.name.SEARCH,
      gender: newGender === 'male' ? 'M' : 'F'
    });

    setSearchCategoryState((prevState) => ({
      ...prevState,
      parentId: 0,
      subParentId: 0,
      gender: newGender,
      selectedAll: false
    }));
  };

  useEffect(() => {
    if (userGender && !gender && !isFetching) {
      setSearchCategoryState((prevState) => ({
        ...prevState,
        gender: userGender === 'M' ? 'male' : 'female'
      }));
    } else if (!userGender && !gender && !isFetching) {
      setSearchCategoryState((prevState) => ({
        ...prevState,
        gender: 'male'
      }));
    }
  }, [setSearchCategoryState, userGender, gender, isFetching]);

  return (
    <Flexbox
      component="section"
      customStyle={{
        margin: '32px 20px',
        borderRadius: 8,
        backgroundColor: common.ui90
      }}
    >
      <Button
        fullWidth
        onClick={handleClick('male')}
        customStyle={
          gender === 'female'
            ? {
                color: common.ui80,
                backgroundColor: common.ui90
              }
            : undefined
        }
      >
        남성
      </Button>
      <Button
        fullWidth
        onClick={handleClick('female')}
        customStyle={
          gender === 'male'
            ? {
                color: common.ui80,
                backgroundColor: common.ui90
              }
            : undefined
        }
      >
        여성
      </Button>
    </Flexbox>
  );
}

export default GenderButtonGroup;
