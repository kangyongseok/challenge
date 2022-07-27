import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import type * as SvgIcons from 'mrcamel-ui/dist/assets/icons';
import { Box, Chip, Flexbox, Icon, Typography } from 'mrcamel-ui';
import { filter, find, uniqBy } from 'lodash-es';

import type { SizeValue, UserInfo } from '@dto/user';

import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import type { Kind } from '@typings/user';
import atom from '@recoil/users';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import sizeMale from '@data/size_male.json';
import sizeFemale from '@data/size_female.json';

const male = sizeMale as SizeValue;
const female = sizeFemale as SizeValue;

const parseKindText = (
  value: string
): { label: string; icon: keyof typeof SvgIcons; parentCategoryId: number } => {
  switch (value) {
    case 'tops':
      return { label: '상의', icon: 'ClothesOutlined', parentCategoryId: 97 };
    case 'bottoms':
      return { label: '하의', icon: 'PantsOutlined', parentCategoryId: 104 };
    default:
      return { label: '신발', icon: 'ShoesOutlined', parentCategoryId: 14 };
  }
};

function SizeInputType() {
  const { data } = useQuery(queryKeys.users.userInfo(), fetchUserInfo);
  const { data: accessUserInfo } = useQueryAccessUser();
  const [defaultGenderSize, setDefaultGenderSize] = useState(male);
  const [selectedSizes, atomSelectedSize] = useRecoilState(atom.selectedSizeState);
  const [, atomSearchModeType] = useRecoilState(atom.searchModeTypeState);

  useEffect(() => {
    if (accessUserInfo) {
      if (accessUserInfo.gender === 'M') {
        setDefaultGenderSize(male);
      } else {
        setDefaultGenderSize(female);
      }
    }
  }, [accessUserInfo]);

  useEffect(() => {
    if (accessUserInfo) {
      const keys = Object.keys(defaultGenderSize);
      keys.forEach((key) => {
        const merged = defaultGenderSize[key].concat(filter(selectedSizes, { kind: key }) as []);
        setDefaultGenderSize((props) => {
          return { ...props, [key]: uniqBy(merged, 'categorySizeId') };
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessUserInfo, selectedSizes]);

  useEffect(() => {
    if (data && selectedSizes.length === 0) {
      const types = Object.keys(data.size.value);
      types.forEach((type) => {
        data.size.value[type].forEach((info) => {
          const obj = {
            kind: type as Kind,
            categorySizeId: info.categorySizeId,
            viewSize: info.viewSize
          };
          if (!find(selectedSizes, { categorySizeId: obj.categorySizeId })) {
            atomSelectedSize((props) => [...props, obj]);
          }
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    const obj = {
      kind: target.dataset.kind as Kind,
      categorySizeId: Number(target.dataset.categorySizeId),
      viewSize: target.dataset.viewSize as string
    };

    if (find(selectedSizes, { categorySizeId: obj.categorySizeId })) {
      atomSelectedSize(selectedSizes.filter((size) => size.categorySizeId !== obj.categorySizeId));
    } else {
      logEvent(attrKeys.userInput.SELECT_ITEM, {
        name: 'SIZE',
        title: 'RECOMMEND',
        att: target.dataset.viewSize
      });

      atomSelectedSize((props) => [...props, obj]);
    }
  };

  const handleClickSearchMode = (e: MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    const obj = {
      kind: target.dataset.kind as Kind,
      parentCategoryId: Number(target.dataset.sizeTypeId)
    };
    let att = target.dataset.kind?.toUpperCase();
    if (target.dataset.kind === 'tops' || target.dataset.kind === 'bottoms') {
      att = target.dataset.kind?.toUpperCase().slice(0, target.dataset.kind.length - 1);
    }

    logEvent(attrKeys.userInput.CLICK_PERSONAL_INPUT, {
      name: 'SIZE',
      title: 'SEARCH',
      att
    });

    atomSearchModeType(obj);
  };

  return (
    <Box customStyle={{ marginTop: 110 }}>
      {data &&
        Object.keys((data as UserInfo).size.value).map((kinds) => (
          <Box customStyle={{ marginBottom: 32 }} key={`kinds-${kinds}`}>
            <Flexbox gap={6} alignment="center">
              <Icon name={parseKindText(kinds).icon} width={30} height={25} />
              <Typography weight="bold" variant="h4">
                {parseKindText(kinds).label}
              </Typography>
              <Chip
                data-size-type-id={parseKindText(kinds).parentCategoryId}
                data-kind={kinds}
                variant="ghost"
                size="xsmall"
                onClick={handleClickSearchMode}
              >
                <Icon name="SearchOutlined" width={12} height={12} />
                <Typography variant="small2" weight="medium">
                  검색해서 찾기
                </Typography>
              </Chip>
            </Flexbox>
            <Flexbox customStyle={{ flexWrap: 'wrap', marginTop: 15, gap: '8px 6px' }}>
              {defaultGenderSize[kinds].map((info) => {
                const isChecked = filter(
                  selectedSizes.filter((size) => size.kind === kinds),
                  {
                    categorySizeId: info.categorySizeId
                  }
                )[0];
                return (
                  <Chip
                    key={`size-${info.viewSize}`}
                    variant={isChecked ? 'outlinedGhost' : 'outlined'}
                    brandColor={isChecked ? 'primary' : 'grey'}
                    data-kind={kinds}
                    data-view-size={info.viewSize}
                    data-category-size-id={info.categorySizeId}
                    onClick={handleClick}
                  >
                    {info.viewSize}
                  </Chip>
                );
              })}
            </Flexbox>
          </Box>
        ))}
    </Box>
  );
}

export default SizeInputType;
