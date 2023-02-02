import { useEffect, useMemo, useRef } from 'react';
import type { MouseEvent } from 'react';

import { Box, Icon, Typography, useTheme } from 'mrcamel-ui';
import { find } from 'lodash-es';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/common';

import type { FilterDropItem, GroupSize, SearchHistoryHookType } from '@typings/camelSeller';

import { DropDownArea, FilterButton, Item, StyledDropDownWrap } from './DropDownSelect.styles';

interface DropDownSelectProps {
  title: string;
  type: SearchHistoryHookType;
  lists?: FilterDropItem[];
  groupSize?: GroupSize[];
  currnetType: SearchHistoryHookType;
  disabledBorder?: boolean;
  selectValue?: number | string;
  right?: number;
  allCount?: number;
  disabledCount?: boolean;
  disabledBg?: boolean;
  groupSelect?: boolean;
  onClick: (parameter: SearchHistoryHookType) => void;
  onClickSelect: (e: MouseEvent<HTMLDivElement>) => void;
}

function DropDownSelect({
  title,
  type,
  lists,
  groupSize,
  currnetType,
  disabledBorder,
  selectValue,
  right,
  allCount,
  disabledCount,
  groupSelect,
  disabledBg,
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
          onClick(null);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClickFilterButton = () => {
    logEvent(attrKeys.camelSeller.CLICK_FILTER, {
      name: attrProperty.name.MARKET_PRICE,
      title: type?.toUpperCase()
    });

    if (currnetType === type) {
      onClick(null);
    } else {
      onClick(type);
    }
  };

  const activeValue = useMemo(() => find(lists, { id: selectValue })?.name, [lists, selectValue]);

  return (
    <StyledDropDownWrap ref={wrapRef}>
      <FilterButton
        disabledBorder={!!disabledBorder}
        data-drop-filter
        isSelectValue={!!activeValue}
        disabledBg={disabledBg}
        variant="solid"
        ref={dropDownIconRef}
        onClick={handleClickFilterButton}
      >
        {activeValue || title}
        <Icon name="DropdownFilled" viewBox="0 0 5 24" />
      </FilterButton>
      <DropDownArea isDisplay={currnetType === type} direction="vertical" right={right as number}>
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
          <Typography
            variant="small2"
            customStyle={{
              color: common.ui60
            }}
          >
            {commaNumber(allCount || 0)}
          </Typography>
        </Item>

        {groupSelect &&
          lists &&
          groupSize?.map(({ label, data }) => (
            <Box key={`group-size-${label}`}>
              {data.length > 0 && (
                <Typography
                  weight="bold"
                  variant="small1"
                  customStyle={{ color: common.ui60, padding: '20px 0 5px 12px' }}
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
                    <Typography
                      variant="small2"
                      customStyle={{
                        color: selectValue === list.id ? primary.light : common.ui60
                      }}
                    >
                      {commaNumber(list.count || 0)}
                    </Typography>
                  </Item>
                ))}
              </Box>
            </Box>
          ))}
        {!groupSelect &&
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
              <Typography
                weight="medium"
                customStyle={{
                  color: selectValue === list.id ? primary.main : common.ui20
                }}
              >
                {list.name}
              </Typography>
              {!disabledCount && (
                <Typography
                  variant="small2"
                  customStyle={{
                    color: selectValue === list.id ? primary.light : common.ui60
                  }}
                >
                  {commaNumber(list.count || 0)}
                </Typography>
              )}
            </Item>
          ))}
      </DropDownArea>
    </StyledDropDownWrap>
  );
}

export default DropDownSelect;
