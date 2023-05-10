import type { MouseEvent } from 'react';

import { useRecoilState } from 'recoil';
import { useQuery } from '@tanstack/react-query';
import { BottomSheet, Flexbox, Typography } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchCommonCodeDetails } from '@api/common';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { camelSellerDialogStateFamily, camelSellerTempSaveDataState } from '@recoil/camelSeller';

function CamelSellerConditionBottomSheet() {
  const [tempData, setTempData] = useRecoilState(camelSellerTempSaveDataState);
  const [{ open }, setOpen] = useRecoilState(camelSellerDialogStateFamily('condition'));
  const { data: codeDetails } = useQuery(queryKeys.commons.codeDetails({ codeId: 14 }), () =>
    fetchCommonCodeDetails({
      codeId: 14
    })
  );

  const handleClickCondition = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_MODAL, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.CONDITION,
      att: target.dataset.value
    });

    setOpen(({ type }) => ({ type, open: false }));
    setTempData({
      ...tempData,
      condition: {
        id: Number(target.dataset.id),
        name: target.dataset.name || '',
        synonyms: target.dataset.value || ''
      }
    });
  };

  return (
    <BottomSheet
      open={open}
      fullScreen
      onClose={() => setOpen(({ type }) => ({ type, open: false }))}
      disableSwipeable
      customStyle={{ padding: '0 20px' }}
    >
      <Typography variant="h2" weight="bold" customStyle={{ margin: '32px 0 20px' }}>
        매물의 상태를 알려주세요.
      </Typography>
      {codeDetails &&
        codeDetails.map(({ id, name, description, synonyms }, index) => (
          <ConditionCard
            key={`condition-card-${id}`}
            data-name={name}
            data-value={synonyms}
            data-id={id}
            direction="vertical"
            justifyContent="center"
            onClick={handleClickCondition}
            hideLine={codeDetails.length - 1 === index}
          >
            <Flexbox alignment="center" gap={12}>
              <StateLabel variant="body2" weight="medium">
                {synonyms}
              </StateLabel>
              <Typography weight="medium" variant="h4">
                {name}
              </Typography>
            </Flexbox>
            <Typography color="ui60" customStyle={{ marginTop: 4, marginLeft: 36 }}>
              {description}
            </Typography>
          </ConditionCard>
        ))}
    </BottomSheet>
  );
}

const ConditionCard = styled(Flexbox)<{
  hideLine?: boolean;
}>`
  padding: 20px 0;

  ${({
    theme: {
      palette: { common }
    },
    hideLine
  }): CSSObject =>
    !hideLine
      ? {
          borderBottom: `1px solid ${common.line01}`
        }
      : {}}
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
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default CamelSellerConditionBottomSheet;
