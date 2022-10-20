import { useCallback } from 'react';

import { useRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Header } from '@components/UI/molecules';
import { Image } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import { logEvent } from '@library/amplitude';

import { fetchLegitsCategories } from '@api/model';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { legitRequestState } from '@recoil/legitRequest';

function LegitRequestSelectCategory() {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [{ brandId }, setLegitRequestState] = useRecoilState(legitRequestState);

  const { data: legitsCategories = [] } = useQuery(
    queryKeys.models.legitsCategories(brandId ? { brandIds: [brandId] } : undefined),
    () => fetchLegitsCategories(brandId ? { brandIds: [brandId] } : undefined)
  );

  const handleClick = useCallback(
    (categoryId: number, categoryName: string) => () => {
      logEvent(attrKeys.legit.CLICK_LEGIT_CATEGORY, {
        name: attrProperty.legitName.LEGIT_PROCESS,
        att: categoryName
      });

      setLegitRequestState((currVal) => ({ ...currVal, categoryId, categoryName }));
      router.push(`/legit/request/${brandId > 0 ? 'selectModel' : 'selectBrand'}`, undefined, {
        shallow: true
      });
    },
    [brandId, router, setLegitRequestState]
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
      <Flexbox component="section" direction="vertical" gap={8}>
        <Typography variant="h2" weight="bold">
          카테고리를 선택해주세요
        </Typography>
        <Typography variant="h4" customStyle={{ color: common.ui60 }}>
          카테고리 선택하면, 감정이 시작됩니다
        </Typography>
      </Flexbox>
      <MenuGrid>
        {legitsCategories.map(({ id, name, nameEng }) => (
          <Menu key={`category-${id}`} onClick={handleClick(id, name.replace(/\(P\)/g, ''))}>
            <Image
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/category/${nameEng}_default.png`}
              alt={name}
              width={48}
              height={48}
              disableAspectRatio
            />
            <Typography variant="h4" weight="medium">
              {name.replace(/\(P\)/g, '')}
            </Typography>
          </Menu>
        ))}
      </MenuGrid>
    </GeneralTemplate>
  );
}

const MenuGrid = styled.section`
  display: grid;
  gap: 12px;
  grid-template: repeat(2, minmax(0, 1fr)) / repeat(2, minmax(0, 1fr));
`;

const Menu = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding: 20px 12px;
  background-color: ${({ theme: { palette } }) => palette.common.bg03};
  border: 1px solid ${({ theme: { palette } }) => palette.common.line01};
  border-radius: 8px;
  cursor: pointer;
`;

export default LegitRequestSelectCategory;
