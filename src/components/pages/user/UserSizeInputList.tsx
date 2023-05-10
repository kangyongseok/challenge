import { useEffect, useState } from 'react';
import type { Dispatch, MouseEvent, SetStateAction } from 'react';

import uniqBy from 'lodash-es/uniqBy';
import find from 'lodash-es/find';
import filter from 'lodash-es/filter';
import { Chip, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';

import type { SizeValue } from '@dto/user';

import { logEvent } from '@library/amplitude';

import { USER_DEFAULT_SIZE } from '@constants/user';
import attrKeys from '@constants/attrKeys';

import type { Kind, SelectSize } from '@typings/user';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';

const USER_SIZE: Record<keyof SizeValue, { label: string; parentCategoryId: number }> = {
  tops: { label: '👕 상의', parentCategoryId: 97 },
  bottoms: { label: '👖 하의', parentCategoryId: 104 },
  shoes: { label: '👟 신발', parentCategoryId: 14 }
};

interface UserSizeInputListProps {
  selectedSizes: SelectSize[];
  setSelectedSize: Dispatch<SetStateAction<SelectSize[]>>;
}

function UserSizeInputList({ selectedSizes, setSelectedSize }: UserSizeInputListProps) {
  const {
    theme: {
      typography,
      palette: { common }
    }
  } = useTheme();
  const { data: myUserInfo } = useQueryMyUserInfo();
  const [genderSize, setGenderSize] = useState<SizeValue | null>(null);
  const defaultSize =
    USER_DEFAULT_SIZE[
      (myUserInfo?.info.value.gender === 'F' ? 'female' : 'male') as keyof typeof USER_DEFAULT_SIZE
    ];

  useEffect(() => {
    const keys = Object.keys(defaultSize);
    if (myUserInfo) {
      const result = {} as SizeValue;
      keys.forEach((key) => {
        result[key] = uniqBy(
          [...(defaultSize as SizeValue)[key], ...(myUserInfo.size.value as SizeValue)[key]],
          'categorySizeId'
        );
      });
      setGenderSize(result);
    }
  }, [myUserInfo, defaultSize]);

  useEffect(() => {
    if (myUserInfo?.size.value && selectedSizes.length === 0) {
      const types = Object.keys(myUserInfo.size.value);
      types.forEach((type) => {
        if (myUserInfo?.size.value)
          myUserInfo.size.value[type].forEach((info) => {
            const obj = {
              kind: type as Kind,
              categorySizeId: info.categorySizeId,
              viewSize: info.viewSize
            };
            if (!find(selectedSizes, { categorySizeId: obj.categorySizeId })) {
              setSelectedSize((props) => [...props, obj]);
            }
          });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myUserInfo]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    const obj = {
      kind: target.dataset.kind as Kind,
      categorySizeId: Number(target.dataset.categorySizeId),
      viewSize: target.dataset.viewSize as string
    };

    if (find(selectedSizes, { categorySizeId: obj.categorySizeId })) {
      setSelectedSize(selectedSizes.filter((size) => size.categorySizeId !== obj.categorySizeId));
    } else {
      logEvent(attrKeys.userInput.SELECT_ITEM, {
        name: 'SIZE',
        title: 'RECOMMEND',
        att: target.dataset.viewSize
      });

      setSelectedSize((props) => [...props, obj]);
    }
  };

  return myUserInfo?.size.value ? (
    <>
      {Object.keys(myUserInfo.size.value)
        .filter((k) => Object.keys(USER_SIZE).includes(k))
        .map((kinds) => (
          <Flexbox key={`kinds-${kinds}`} component="section" direction="vertical" gap={8}>
            <Typography weight="bold" variant="h4" customStyle={{ color: common.ui60 }}>
              {USER_SIZE[kinds].label}
            </Typography>
            <Flexbox gap={8} customStyle={{ flexWrap: 'wrap' }}>
              {genderSize &&
                (genderSize as SizeValue)[kinds].map((info) => {
                  const isChecked = filter(
                    selectedSizes.filter((size) => size.kind === kinds),
                    { categorySizeId: info.categorySizeId }
                  )[0];

                  return (
                    <Chip
                      key={`size-${info.size || info.viewSize}}`}
                      variant={isChecked ? 'solid' : 'ghost'}
                      size="xlarge"
                      brandColor="black"
                      data-kind={kinds}
                      data-view-size={info.size || info.viewSize}
                      data-category-size-id={info.categorySizeId}
                      onClick={handleClick}
                      customStyle={{ width: 72, fontWeight: typography.h3.weight.regular }}
                    >
                      {info.size || info.viewSize}
                    </Chip>
                  );
                })}
            </Flexbox>
          </Flexbox>
        ))}
    </>
  ) : null;
}

export default UserSizeInputList;
