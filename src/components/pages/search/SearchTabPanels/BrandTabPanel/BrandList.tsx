import { useEffect, useMemo, useRef, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import capitalize from 'lodash-es/capitalize';
import type { Property } from 'csstype';
import { useQuery } from '@tanstack/react-query';
import { Flexbox, Image, Typography } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchBrands } from '@api/brand';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { doubleCon } from '@constants/consonant';
import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { deDuplication, getBrandListTitles, parseWordToConsonant, sortBrand } from '@utils/brands';

import { showAppDownloadBannerState } from '@recoil/common';
import { PortalConsumer } from '@provider';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

// eslint-disable-next-line no-useless-escape
const koRegexp = /^[\w`.~!@#$%^&*|\\;:\/?]/;

function BrandList() {
  const router = useRouter();
  const { tab = 'keyword' } = router.query;

  const {
    mode,
    palette: { common },
    zIndex
  } = useTheme();

  const { data: brands = [] } = useQuery(queryKeys.brands.all, fetchBrands);
  const { data: { info: { value: { gender = '' } = {} } = {} } = {} } = useQueryUserInfo();

  const [position, setPosition] = useState<Property.Position>('static');

  const brandRefs = useRef<HTMLDivElement[]>([]);
  const titleRef = useRef<HTMLDivElement>(null);

  const { cons = [], sortedBrands = [] } = useMemo(() => {
    if (brands.length === 0) return { brandsIndexList: [], brandsList: [] };

    const newBrands = deDuplication(brands.map((data) => parseWordToConsonant(data.name[0])));
    const newCons = newBrands.filter((k: string) => !koRegexp.test(k) && !doubleCon.includes(k));

    if (newBrands.some((k: string) => koRegexp.test(k))) newCons.push('#');

    const titles = getBrandListTitles(newBrands, koRegexp);

    let newSortedBrands = brands.sort((a, b) => sortBrand(a.name, b.name));
    newSortedBrands = titles
      .map((title) =>
        newSortedBrands
          .filter((brand) => title.split(', ').includes(parseWordToConsonant(brand.name[0])))
          .map((brand) => ({
            ...brand,
            con: title
              .split(',')
              .filter((splitTitle) => splitTitle === parseWordToConsonant(brand.name[0]))[0]
          }))
      )
      .flat();
    newSortedBrands = newSortedBrands.concat(
      brands.filter(({ id }) => !newSortedBrands.find((newSortedBrand) => id === newSortedBrand.id))
    );

    return {
      sortedBrands: newSortedBrands,
      cons: newCons
    };
  }, [brands]);

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  const handleClick = (con: string, index: number) => () => {
    logEvent(attrKeys.search.CLICK_NAVIGATION_LETTER, { att: con });

    if (index === cons.length - 1) {
      window.scrollTo(0, document.body.scrollHeight);
      return;
    }

    const findBrandRef = brandRefs.current.find((brandRef) => brandRef.dataset.con === con);

    if (findBrandRef) {
      window.scrollTo({
        top: findBrandRef.offsetTop - 64
      });
    }
  };

  const handleClickBrand = (name: string) => () => {
    logEvent(attrKeys.brand.CLICK_BRAND_NAME, {
      name: attrProperty.name.SEARCH,
      title: attrProperty.title.BRAND_LIST,
      att: name
    });

    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.name.SEARCH,
      title: attrProperty.title.BRAND_LIST,
      type: attrProperty.type.INPUT
    });

    router.push({
      pathname: `/products/brands/${name.replace(/ x /g, '-')}`,
      query:
        gender.length > 0 && gender !== 'N'
          ? {
              genders: [gender === 'M' ? 'male' : 'female']
            }
          : {}
    });
  };

  useEffect(() => {
    if (tab !== 'brand') setPosition('static');
  }, [tab]);

  useEffect(() => {
    const handleScroll = () => {
      if (!titleRef.current || tab !== 'brand') return;

      const { offsetTop } = titleRef.current;

      if (window.scrollY >= offsetTop) {
        setPosition('fixed');
      } else {
        setPosition('static');
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [tab]);

  return (
    <>
      {position === 'fixed' && (
        <PortalConsumer>
          <Typography
            variant="h3"
            weight="bold"
            customStyle={{
              position: 'fixed',
              top: 96,
              width: '100%',
              padding: 20,
              backgroundColor: common.uiWhite,
              transform: `translateY(${showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0}px)`,
              transition: 'transform 0.5s',
              zIndex: zIndex.header - 1
            }}
          >
            전체 브랜드
          </Typography>
        </PortalConsumer>
      )}
      <Typography
        ref={titleRef}
        variant="h3"
        weight="bold"
        customStyle={{
          visibility: position === 'static' ? 'visible' : 'hidden',
          marginTop: 12,
          padding: 20
        }}
      >
        전체 브랜드
      </Typography>
      <Flexbox
        justifyContent="space-between"
        customStyle={{
          padding: '0 0 20px 20px'
        }}
      >
        <Flexbox
          direction="vertical"
          alignment="flex-start"
          gap={20}
          customStyle={{
            padding: '8px 0'
          }}
        >
          {sortedBrands.map(({ name, nameEng, nameLogo, con }, index) => (
            <Flexbox
              key={`search-sorted-brand-${nameEng}`}
              ref={(ref) => {
                if (ref) brandRefs.current[index] = ref;
              }}
              data-con={con}
              onClick={handleClickBrand(name)}
              gap={20}
              customStyle={{
                width: '100%'
              }}
            >
              <Image
                width={48}
                height={48}
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/brands/${
                  mode === 'light' ? 'white' : 'black'
                }/${nameLogo.toLowerCase().replace(/\s/g, '')}.jpg`}
                alt={name}
                round={8}
                disableAspectRatio
              />
              <Flexbox direction="vertical" gap={4}>
                <Typography variant="h4" weight="bold">
                  {name}
                </Typography>
                <Typography variant="body2" color="ui60">
                  {nameEng
                    .split(/\s/)
                    .map((brandName) => capitalize(brandName))
                    .join(' ')}
                </Typography>
              </Flexbox>
            </Flexbox>
          ))}
        </Flexbox>
        {position === 'fixed' && (
          <PortalConsumer>
            <Flexbox
              direction="vertical"
              customStyle={{
                position: 'fixed',
                top: 160,
                right: 0,
                width: 'fit-content',
                backgroundColor: common.uiWhite,
                transform: `translateY(${
                  showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0
                }px)`,
                transition: 'transform 0.5s',
                zIndex: zIndex.header - 1,
                height: 'calc(100% - 220px)',
                padding: '8px 0',
                overflowY: 'auto'
              }}
            >
              {cons.map((con, index) => (
                <Typography
                  key={`fixed-con-${con}`}
                  variant="body2"
                  onClick={handleClick(con, index)}
                  customStyle={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 52,
                    minHeight: 32
                  }}
                  color="#999999"
                >
                  {con}
                </Typography>
              ))}
            </Flexbox>
          </PortalConsumer>
        )}
        <Flexbox
          direction="vertical"
          customStyle={{
            visibility: position === 'static' ? 'visible' : 'hidden',
            height: 'calc(100% - 220px)',
            padding: '8px 0',
            overflowY: 'auto'
          }}
        >
          {cons.map((con, index) => (
            <Typography
              key={`con-${con}`}
              variant="body2"
              onClick={handleClick(con, index)}
              customStyle={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 52,
                height: 32
              }}
              color="#999999"
            >
              {con}
            </Typography>
          ))}
        </Flexbox>
      </Flexbox>
    </>
  );
}

export default BrandList;
