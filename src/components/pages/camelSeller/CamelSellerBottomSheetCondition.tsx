import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { BottomSheet, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchCommonCodeDetails } from '@api/common';

import queryKeys from '@constants/queryKeys';
import { CAMEL_SELLER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { SubmitType } from '@typings/camelSeller';
import { CamelSellerLocalStorage } from '@typings/camelSeller';
import {
  camelSellerBooleanStateFamily,
  camelSellerDialogStateFamily,
  camelSellerEditState,
  camelSellerSubmitState
} from '@recoil/camelSeller';

function CamelSellerBottomSheetCondition() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setCamelSeller] = useState<CamelSellerLocalStorage>();
  const [submitState, setSubmitState] = useRecoilState(camelSellerSubmitState);
  const [editData, setEditData] = useRecoilState(camelSellerEditState);
  const editMode = useRecoilValue(camelSellerBooleanStateFamily('edit'));
  const [{ open }, setOpen] = useRecoilState(camelSellerDialogStateFamily('condition'));
  const { data: codeDetails } = useQuery(queryKeys.commons.codeDetails(14), () =>
    fetchCommonCodeDetails({
      codeId: 14
    })
  );

  useEffect(() => {
    setCamelSeller(LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage);
  }, []);

  useEffect(() => {
    if (open) {
      logEvent(attrKeys.camelSeller.VIEW_PRODUCT_MODAL, {
        name: attrProperty.name.PRODUCT_MAIN,
        title: attrProperty.title.CONDITION
      });
    }
  }, [open]);

  const handleClickCondition = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_MODAL, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.CONDITION,
      att: target.dataset.name
    });

    setOpen(({ type }) => ({ type, open: false }));
    if (!editMode.isState) {
      LocalStorage.set(CAMEL_SELLER, {
        ...(LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage),
        condition: {
          name: target.dataset.name as string,
          id: Number(target.dataset.id)
        }
      });
    }
    if (editMode.isState) {
      setEditData({
        ...(editData as CamelSellerLocalStorage),
        condition: {
          name: target.dataset.name as string,
          id: Number(target.dataset.id)
        }
      });
    }

    setSubmitState({
      ...(submitState as SubmitType),
      conditionId: Number(target.dataset.id)
    });
  };

  return (
    <BottomSheet
      open={open}
      onClose={() => setOpen(({ type }) => ({ type, open: false }))}
      customStyle={{ padding: '0 20px' }}
    >
      {codeDetails &&
        codeDetails.map(({ id, name, description, synonyms }) => (
          <ConditionCard
            key={`condition-card-${id}`}
            data-name={name}
            data-value={synonyms}
            data-id={id}
            direction="vertical"
            justifyContent="center"
            onClick={handleClickCondition}
          >
            <Flexbox alignment="center">
              <Typography weight="bold" variant="h4">
                {name}
              </Typography>
              <StateLabel>{synonyms}</StateLabel>
            </Flexbox>
            <Typography variant="small1" customStyle={{ color: common.ui60, marginTop: 6 }}>
              {description}
            </Typography>
          </ConditionCard>
        ))}
    </BottomSheet>
  );
}

const ConditionCard = styled(Flexbox)`
  height: 87px;
  border-bottom: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui90};
`;

const StateLabel = styled(Typography)`
  background: ${({
    theme: {
      palette: { primary }
    }
  }) => primary.highlight};
  color: ${({
    theme: {
      palette: { primary }
    }
  }) => primary.main};
  width: 19px;
  height: 19px;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.typography.small2.size};
  text-align: center;
  margin-left: 8px;
`;

export default CamelSellerBottomSheetCondition;
