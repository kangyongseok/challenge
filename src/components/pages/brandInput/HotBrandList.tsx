import type { MouseEvent } from 'react';

import type { GetServerSidePropsContext } from 'next';
import { Box, Icon, Image, Typography, useTheme } from 'mrcamel-ui';
import { find } from 'lodash-es';
import { QueryClient, dehydrate, useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import type { Brand } from '@dto/brand';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchHotBrands } from '@api/brand';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';

import type { SelectedHotBrand } from '@typings/brands';

interface HotBrandListProps {
  onClick: (parameter: SelectedHotBrand) => void;
  checkList: SelectedHotBrand[];
}

function HotBrandList({ onClick, checkList }: HotBrandListProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const { data: brands, isLoading } = useQuery<Brand[], Error>(
    queryKeys.brands.hotBrands(),
    fetchHotBrands
  );

  const handleBrandClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const remoceSpaceString = target.querySelector('div')?.innerText.replace(/(\s*)/g, '');
    if (remoceSpaceString === target.dataset.name) {
      logEvent(attrKeys.userInput.SELECT_ITEM, {
        name: 'BRAND',
        title: 'RECOMMEND',
        att: target.dataset.name
      });
    }

    onClick({ id: Number(target.dataset.id), name: target.dataset.name });
  };

  if (isLoading) return null;

  return (
    <StyledHotBrandWrap>
      <GridWrap>
        {brands?.map(({ nameEng, name, id, viewName }) => (
          <Box
            key={`hot-brand-${id}`}
            data-id={id}
            data-name={name}
            data-checked={!!find(checkList, { name })}
            onClick={handleBrandClick}
            customStyle={{ width: 64, textAlign: 'center', position: 'relative', margin: '0 auto' }}
          >
            {find(checkList, { name }) && (
              <CircleChecked>
                <Icon name="CheckOutlined" width={100} height={50} color={common.uiWhite} />
              </CircleChecked>
            )}
            <Image
              width={64}
              height={64}
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/brands/${nameEng
                .toLowerCase()
                .replace(/\s/g, '')}.png`}
              alt={nameEng}
              round="50%"
              disableAspectRatio
              style={{ backgroundColor: '#eff2f7' }}
            />
            <Typography
              variant="small1"
              weight="medium"
              customStyle={{ marginTop: 8, minHeight: 18, wordBreak: 'keep-all' }}
            >
              {viewName || name}
            </Typography>
          </Box>
        ))}
      </GridWrap>
    </StyledHotBrandWrap>
  );
}

const StyledHotBrandWrap = styled.div`
  flex-grow: 1;
  margin-top: 226px;
  height: 100%;
`;

const GridWrap = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px 20px;
`;

const CircleChecked = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(24, 51, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const queryClient = new QueryClient();
  Initializer.initAccessTokenByCookies(getCookies({ req }));
  Initializer.initAccessUserInQueryClientByCookies(getCookies({ req }), queryClient);

  await queryClient.prefetchQuery(queryKeys.brands.hotBrands(), fetchHotBrands);

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

export default HotBrandList;
