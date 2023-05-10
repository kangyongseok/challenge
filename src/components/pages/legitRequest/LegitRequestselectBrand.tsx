import { useCallback, useEffect } from 'react';

import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import { logEvent } from '@library/amplitude';

import { fetchLegitsBrands } from '@api/model';

import queryKeys from '@constants/queryKeys';
import { IOS_SAFE_AREA_BOTTOM } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import { legitRequestState } from '@recoil/legitRequest';

function LegitRequestSelectBrand() {
  const router = useRouter();
  const [{ categoryId }, setLegitRequestState] = useRecoilState(legitRequestState);

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: legitsBrands = [] } = useQuery(
    queryKeys.models.legitsBrands(categoryId > 0 ? { categoryIds: [categoryId] } : undefined),
    () => fetchLegitsBrands(categoryId > 0 ? { categoryIds: [categoryId] } : undefined)
  );

  useEffect(() => {
    logEvent(attrKeys.legit.VIEW_LEGIT_BRAND, {
      name: attrProperty.legitName.LEGIT_PROCESS
    });
  }, []);

  const handleClick = useCallback(
    (brandId: number, brandName: string, brandLogo: string) => () => {
      logEvent(attrKeys.legit.CLICK_LEGIT_BRAND, {
        name: attrProperty.legitName.LEGIT_PROCESS,
        att: brandName
      });

      setLegitRequestState((currVal) => ({
        ...currVal,
        brandId,
        brandName,
        brandLogo: `https://${process.env.IMAGE_DOMAIN}/assets/images/brands/transparent/${brandLogo
          .toLowerCase()
          .replace(/\s/g, '')}.png`
      }));
      router.push('/legit/request/selectModel', undefined, { shallow: true });
    },
    [router, setLegitRequestState]
  );

  return (
    <GeneralTemplate
      header={<Header showRight={false} hideTitle customStyle={{ backgroundColor: common.bg03 }} />}
      customStyle={{
        height: 'auto',
        minHeight: '100%',
        backgroundColor: common.bg03,
        userSelect: 'none',
        '& > main': { padding: '28px 20px 0', rowGap: 32 }
      }}
    >
      <Typography variant="h2" weight="bold">
        브랜드를 선택해주세요
      </Typography>
      <Flexbox
        component="section"
        direction="vertical"
        gap={10}
        customStyle={{ paddingBottom: isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_BOTTOM : 0 }}
      >
        {legitsBrands.map(({ id, name, nameEng }) => (
          <Flexbox
            key={`brand-${id}`}
            gap={20}
            alignment="center"
            customStyle={{ cursor: 'pointer' }}
            onClick={handleClick(id, name, nameEng.toLocaleLowerCase().split(' ').join(''))}
          >
            <Avatar
              width={64}
              height={64}
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/brands/transparent/${nameEng
                .toLocaleLowerCase()
                .split(' ')
                .join('')}.png`}
              alt="Brand Logo Img"
            />
            <Flexbox direction="vertical" gap={2} customStyle={{ padding: '12px 0px' }}>
              <Typography variant="h3" weight="medium">
                {name}
              </Typography>
              <Typography variant="body2" customStyle={{ color: common.ui80 }}>
                {nameEng}
              </Typography>
            </Flexbox>
          </Flexbox>
        ))}
      </Flexbox>
    </GeneralTemplate>
  );
}

export default LegitRequestSelectBrand;
