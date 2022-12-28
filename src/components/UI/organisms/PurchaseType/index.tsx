import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import { useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { Box, Flexbox, Image, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { purchaseType } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { disabledState, purchaseTypeIdState } from '@recoil/onboarding';

const BASE_URL = `https://${process.env.IMAGE_DOMAIN}/assets/images/onboarding`;

function PurchaseType() {
  const {
    theme: { palette }
  } = useTheme();

  const [selectedType, setSelectedType] = useState(0);
  const setDisabled = useSetRecoilState(disabledState('purchase'));
  const setPurchaseTypeId = useSetRecoilState(purchaseTypeIdState);
  const { data: { personalStyle: { purchaseTypes = [] } = {} } = {} } = useQuery(
    queryKeys.users.userInfo(),
    fetchUserInfo,
    {
      refetchOnMount: true
    }
  );

  useEffect(() => {
    if (purchaseTypes[0]) {
      setSelectedType(purchaseTypes[0].id as number);
    }
  }, [purchaseTypes, setPurchaseTypeId]);

  useEffect(() => {
    setDisabled(({ type }) => ({
      type,
      open: !selectedType
    }));
  }, [selectedType, setDisabled, setPurchaseTypeId]);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget as HTMLDivElement;
    const typeNum = Number(target.dataset.type);
    const { title } = target.dataset;

    if (selectedType === typeNum) {
      setSelectedType(0);
    } else {
      logEvent(attrKeys.welcome.SELECT_ITEM, {
        name: attrProperty.name.PERSONAL_INPUT,
        title: attrProperty.title.BUYINGTYPE,
        att: title
      });
      setPurchaseTypeId(typeNum);
      setSelectedType(typeNum);
    }
  };

  return (
    <Flexbox gap={12} customStyle={{ marginTop: 52 }} direction="vertical">
      {purchaseType.map((data) => (
        <TypeCard
          key={`type-card-${data.type}`}
          gap={16}
          data-type={data.value}
          data-title={data.title}
          onClick={handleClick}
          isMatch={selectedType === data.value}
        >
          <Image
            width={32}
            src={`${BASE_URL}/${data.icon}.png`}
            alt="Purchase Type Img"
            disableAspectRatio
          />
          <Box>
            <Typography
              weight="bold"
              variant="h3"
              customStyle={{
                marginBottom: 2,
                color: selectedType === data.value ? palette.common.uiWhite : palette.common.ui20
              }}
            >
              {data.title}
            </Typography>
            <Typography
              variant="small1"
              customStyle={{
                color: selectedType === data.value ? palette.common.uiWhite : palette.common.ui60
              }}
            >
              {data.subTitle}
            </Typography>
          </Box>
        </TypeCard>
      ))}
    </Flexbox>
  );
}

const TypeCard = styled(Flexbox)<{ isMatch: boolean }>`
  width: 100%;
  height: 82px;
  border-radius: 8px;
  background: ${({ theme: { palette }, isMatch }) =>
    isMatch ? palette.common.ui20 : palette.common.ui95};
  padding: 20px 24px;
`;

export default PurchaseType;
