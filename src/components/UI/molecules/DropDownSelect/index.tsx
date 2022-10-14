import { useEffect, useMemo, useRef } from 'react';
import type { MouseEvent } from 'react';

import { Box, Icon, Typography, useTheme } from 'mrcamel-ui';
import { find } from 'lodash-es';

import { Image } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/common';

import type { FilterDropItem, GroupSize } from '@typings/camelSeller';

import { DropDownArea, FilterButton, Item, StyledDropDownWrap } from './DropDownSelect.styles';

interface DropDownSelectProps {
  title: string;
  type: string;
  lists?: FilterDropItem[];
  groupSize?: GroupSize[];
  currnetType: string;
  borderHidden?: boolean;
  selectValue?: number | string;
  right?: number;
  allCount?: number;
  onClick: (parameter: string) => void;
  onClickSelect: (e: MouseEvent<HTMLDivElement>) => void;
}

function DropDownSelect({
  title,
  type,
  lists,
  groupSize,
  currnetType,
  borderHidden,
  selectValue,
  right,
  allCount,
  onClick,
  onClickSelect
}: DropDownSelectProps) {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const wrapRef = useRef<HTMLDivElement>(null);
  const dropDownIconRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.querySelector('#sheet-root')?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (wrapRef.current) {
        if (
          !target?.dataset.dropFilter &&
          !(target.parentNode as HTMLElement)?.dataset.dropFilter
        ) {
          onClick('');
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClickFilterButton = () => {
    logEvent(attrKeys.camelSeller.CLICK_FILTER, {
      name: attrProperty.name.MARKET_PRICE,
      title: type.toUpperCase()
    });

    if (currnetType === type) {
      onClick('');
    } else {
      onClick(type);
    }
  };

  const activeValue = useMemo(() => find(lists, { id: selectValue })?.name, [lists, selectValue]);

  return (
    <StyledDropDownWrap ref={wrapRef}>
      <FilterButton
        borderHidden={!!borderHidden}
        endIcon={<Icon name="DropdownFilled" viewBox="0 0 5 24" />}
        onClick={handleClickFilterButton}
        data-drop-filter
        isSelectValue={!!activeValue && type !== 'recent'}
        isRecent={type === 'recent'}
        variant="contained"
        ref={dropDownIconRef}
      >
        {activeValue || title}
      </FilterButton>
      <DropDownArea isDisplay={currnetType === type} direction="vertical" right={right as number}>
        {type !== 'recent' && (
          <Item
            isActive={selectValue === 'all'}
            alignment="center"
            gap={4}
            data-drop-filter
            data-type={type}
            onClick={onClickSelect}
          >
            <Typography
              weight="medium"
              customStyle={{
                color: common.ui20
              }}
            >
              전체보기
            </Typography>
            {allCount && (
              <Typography
                variant="small2"
                customStyle={{
                  color: common.ui60
                }}
              >
                {commaNumber(allCount)}
              </Typography>
            )}
          </Item>
        )}

        {type === 'size' &&
          lists &&
          groupSize?.map(({ label, data }) => (
            <Box key={`group-size-${label}`}>
              {data.length > 0 && (
                <Typography
                  weight="bold"
                  variant="small1"
                  customStyle={{ color: common.ui60, padding: '32px 0 5px 12px' }}
                >
                  {label}
                </Typography>
              )}
              <Box
                customStyle={
                  lists.length > 20 ? { display: 'grid', gridTemplateColumns: '1fr 1fr' } : {}
                }
              >
                {data.map((list) => (
                  <Item
                    isActive={selectValue === list.id}
                    alignment="center"
                    gap={4}
                    key={`drop-down-${list.name}`}
                    data-drop-filter
                    data-type={type}
                    data-item={JSON.stringify(list)}
                    onClick={onClickSelect}
                  >
                    <Typography
                      weight="medium"
                      customStyle={{
                        color: selectValue === list.id ? primary.main : common.ui20
                      }}
                    >
                      {list.name}
                    </Typography>
                    {list.count && (
                      <Typography
                        variant="small2"
                        customStyle={{
                          color: selectValue === list.id ? primary.light : common.ui60
                        }}
                      >
                        {commaNumber(list.count)}
                      </Typography>
                    )}
                  </Item>
                ))}
              </Box>
            </Box>
          ))}
        {type !== 'size' &&
          lists?.map((list) => (
            <Item
              isActive={selectValue === list.id}
              alignment="center"
              gap={4}
              key={`drop-down-${list.name}`}
              data-drop-filter
              data-type={type}
              data-item={JSON.stringify(list)}
              onClick={onClickSelect}
            >
              {type === 'platform' && list.hasImage && (
                <Image
                  src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${list.id}.png`}
                  alt={list.name}
                  disableAspectRatio
                  width={18}
                />
              )}
              <Typography
                weight="medium"
                customStyle={{
                  color: selectValue === list.id ? primary.main : common.ui20
                }}
              >
                {list.name}
              </Typography>
              {list.count && (
                <Typography
                  variant="small2"
                  customStyle={{
                    color: selectValue === list.id ? primary.light : common.ui60
                  }}
                >
                  {commaNumber(list.count)}
                </Typography>
              )}
            </Item>
          ))}
      </DropDownArea>
    </StyledDropDownWrap>
  );
}

export default DropDownSelect;
