import { useCallback, useEffect, useState } from 'react';

import { useQuery } from 'react-query';
import { Icon } from 'mrcamel-ui';
import styled from '@emotion/styled';

import SearchBar from '@components/UI/molecules/SearchBar';
import { BottomNavigation, Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { BrandIndex, BrandList, BrandSearchModal, BrandSwitchLang } from '@components/pages/brand';

import type { AllBrand } from '@dto/brand';

import localStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchBrands } from '@api/brand';

import queryKeys from '@constants/queryKeys';
import { BRAND_STATE } from '@constants/localStorage';
import { baseCons, doubleCon } from '@constants/consonant';
import attrKeys from '@constants/attrKeys';

import scrollCenterIndex from '@utils/brands/scrollCenterIndex';
import { deDuplication, getBrandListTitles, parseWordToConsonant, sortBrand } from '@utils/brands';

import type { NewBrands, ScrollStateType } from '@typings/brands';

/* eslint-disable no-useless-escape */
const koRegexp = /^[\w`.~!@#$%^&*|\\;:\/?]/;
const enRegexp = /^[\d`.~!@#$%^&*|\\;:\/?]/;

function Brands() {
  const { data: brands, isSuccess } = useQuery<AllBrand[], Error>(
    queryKeys.brands.all,
    fetchBrands
  );
  const [ko, setKo] = useState<string[]>([]);
  const [en, setEn] = useState<string[]>([]);
  const [koBrands, setKoBrands] = useState<NewBrands[]>([]);
  const [enBrands, setEnBrands] = useState<NewBrands[]>([]);
  const [koTitles, setKoTitles] = useState<string[]>([]);
  const [enTitles, setEnTitles] = useState<string[]>([]);
  const [currentTitle, setCurrentTitle] = useState('');
  const [lang, setLang] = useState('');
  const [indexRefs, setIndexRefs] = useState<HTMLButtonElement[]>([]);
  const [listTitles, setListTitles] = useState<HTMLDivElement[]>([]);
  const [indexAreaRef, setIndexAreaRef] = useState<HTMLDivElement>();
  const [isSearchModal, setIsSearchModal] = useState<boolean>(false);

  useEffect(() => {
    logEvent(attrKeys.brands.VIEW_BRAND_LIST);

    const localState: ScrollStateType = localStorage.get(BRAND_STATE) as ScrollStateType;
    if (localState) {
      setLang(localState.lang);
      setCurrentTitle(localState.currentTitle);
      setTimeout(() => {
        window.scrollTo(0, localState.listScroll);
        localStorage.remove(BRAND_STATE);
      }, 100);
    }
  }, []);

  useEffect(() => {
    if (isSuccess) {
      parseInitData();
      handleScroll();

      const localState: ScrollStateType = localStorage.get(BRAND_STATE) as ScrollStateType;
      if (localState) return;

      if (!currentTitle) {
        setCurrentTitle('ㄱ');
      }
      if (!lang) {
        setLang('ko');
      }
    }

    /* eslint-disable react-hooks/exhaustive-deps */
  }, [isSuccess, lang, currentTitle]);

  const callbackScroll = useCallback(() => {
    const indexBtns = indexRefs as HTMLButtonElement[];
    const activeBtn = indexBtns.filter((item) => item?.dataset.active === 'true');
    const el = indexAreaRef as HTMLDivElement;
    if (indexAreaRef) {
      scrollCenterIndex(el, activeBtn[0]);
    }

    listTitles.forEach((list) => {
      if (list) {
        if (list.offsetTop < window.pageYOffset) {
          setCurrentTitle(list.outerText[0]);
        }
      }
    });
  }, [indexAreaRef]);

  const handleScroll = () => {
    window.addEventListener('scroll', callbackScroll);
  };

  const storageSet = () => {
    const indexBtns = indexRefs as HTMLButtonElement[];
    const activeBtn = indexBtns.filter((item) => item?.dataset.active === 'true');
    localStorage.set(BRAND_STATE, {
      lang,
      currentTitle: activeBtn[0].outerText[0],
      listScroll: window.scrollY
    });
  };

  const parseInitData = () => {
    const typeBrands = brands as AllBrand[];
    const extractionKo = typeBrands.map((data) => parseWordToConsonant(data.name[0]));
    const extractionEn = typeBrands.map((data) => data.nameEng[0].toUpperCase());
    const resultKo = deDuplication(extractionKo);
    const resultEn = deDuplication(extractionEn);
    const filterKo = resultKo
      .filter((k: string) => !koRegexp.test(k))
      .filter((k: string) => !doubleCon.includes(k));
    if (resultKo.filter((k: string) => koRegexp.test(k)).length > 0) {
      filterKo.push('#');
    }
    setKo(filterKo as string[]);
    setEn(resultEn as string[]);
    setNewObject(extractionKo, 'ko');
    setNewObject(extractionEn, 'en');
    const sortKoBrands = [...typeBrands].sort((a, b) => sortBrand(a.name, b.name));
    const sortEngBrands = [...typeBrands].sort((b1, b2) =>
      sortBrand(b1.nameEng.toUpperCase(), b2.nameEng.toUpperCase())
    );
    setKoBrands(sortKoBrands as NewBrands[]);
    setEnBrands(sortEngBrands as NewBrands[]);
    setKoTitles(getBrandListTitles(resultKo as string[], koRegexp));
    setEnTitles(getBrandListTitles(resultEn as string[], enRegexp));
  };

  const setNewObject = (setData: string[], key: string) => {
    const typeBrands = brands as AllBrand[];
    setData.forEach((data, i) => {
      let result = data;
      if (key === 'ko') {
        const index = doubleCon.findIndex((el) => el === data);
        if (koRegexp.test(data)) {
          result = '0-9';
        } else {
          result = index === -1 ? data : `${baseCons[index]}, ${data}`;
        }
      }
      typeBrands[i] = {
        ...typeBrands[i],
        [key]: result
      };
    });
  };

  const handleClickLang = (selectLang: string) => {
    const mode = selectLang === 'ko' ? 'KOR' : 'ENG';
    logEvent(attrKeys.brands.CLICK_NAVIGATION_MODE, {
      name: 'BRAND_LIST',
      mode
    });

    const indexBtns = indexRefs as HTMLButtonElement[];
    if (selectLang === 'ko') {
      setCurrentTitle('ㄱ');
    } else {
      setCurrentTitle('A');
    }
    setLang(selectLang);
    scrollMove(0);
    setTimeout(() => {
      (indexBtns[0].parentNode as HTMLElement).scrollTo(0, 0);
    }, 0);
  };

  const scrollMove = (value: number) => {
    window.scrollTo(0, value);
  };

  const handleClickIndex = (selectIndex: string) => {
    logEvent(attrKeys.brands.CLICK_NAVIGATION_LETTER, {
      name: 'BRAND_LIST',
      att: selectIndex
    });

    const findListEl = listTitles.filter((list) => list?.outerText[0] === selectIndex);
    scrollMove(findListEl[0] ? findListEl[0].offsetTop + 10 : document.body.scrollHeight);
    setCurrentTitle(selectIndex);
  };

  const handleModalToggle = () => {
    if (!isSearchModal) logEvent(attrKeys.brands.CLICK_BRAND_SEARCH);
    const element = document.querySelector('html');

    if (isSearchModal) {
      element?.removeAttribute('style');
    } else {
      element?.setAttribute('style', 'overflow: hidden');
    }
    setIsSearchModal((props) => !props);
  };

  return (
    <GeneralTemplate header={<Header />} footer={<BottomNavigation />}>
      <BrandsHeaderArea isSearchModal={isSearchModal}>
        {!isSearchModal && (
          <SearchBar
            fullWidth
            readOnly
            customStyle={{ marginBottom: 24 }}
            startIcon={<Icon name="SearchOutlined" color="primary" />}
            placeholder="브랜드 검색"
            onClick={handleModalToggle}
          />
        )}
        {isSearchModal && <div style={{ height: 72 }} />}
        <BrandSwitchLang onClick={handleClickLang} lang={lang} />
      </BrandsHeaderArea>
      <BrandListArea isSearchModal={isSearchModal}>
        <BrandList
          lang={lang}
          brands={lang === 'ko' ? koBrands : enBrands}
          brandTitles={lang === 'ko' ? koTitles : enTitles}
          setListTitles={setListTitles}
          storageSet={storageSet}
        />
        <BrandIndex
          onClick={handleClickIndex}
          currentTitle={currentTitle}
          langList={lang === 'ko' ? ko : en}
          setIndexRefs={setIndexRefs}
          setIndexAreaRef={setIndexAreaRef}
        />
      </BrandListArea>
      {isSearchModal && <BrandSearchModal close={handleModalToggle} />}
    </GeneralTemplate>
  );
}

const BrandsHeaderArea = styled.div<{ isSearchModal: boolean }>`
  position: fixed;
  width: calc(100% - 40px);
  z-index: 10;
  background: ${({ theme: { palette } }) => palette.common.white};
  padding-top: 8px;
`;

const BrandListArea = styled.div<{ isSearchModal: boolean }>`
  position: relative;
  margin-top: 157px;
  overflow: ${({ isSearchModal }) => (isSearchModal ? 'hidden' : 'auto')};
`;

export default Brands;
