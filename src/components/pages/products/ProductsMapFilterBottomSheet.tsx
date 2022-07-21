import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { useQuery, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import {
  Alert,
  BottomSheet,
  CtaButton,
  Flexbox,
  Icon,
  Tooltip,
  Typography,
  useTheme
} from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { filterCodeIds, mapFilterOptions } from '@constants/productsFilter';
import { PRODUCT_NAME } from '@constants/product';
import attrKeys from '@constants/attrKeys';

import {
  productsFilterStateFamily,
  searchParamsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';
import { userOnBoardingTriggerState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function getMessageByActiveIndex(index: number) {
  if (index === 1) {
    return '걸어서 20분 거리의 매물만 보여드릴게요';
  }
  if (index === 2) {
    return '지하철 3정거장 거리의 매물만 보여드릴게요';
  }
  if (index === 3) {
    return '택시 10분 거리의 매물만 보여드릴게요';
  }
  if (index === 4) {
    return '택시 30분 거리의 매물만 보여드릴게요';
  }
  if (index === 5) {
    return '전체 거리의 매물을 보여드릴게요';
  }
  return '선택한 거리의 매물만 보여드릴게요';
}

function ProductsMapFilterBottomSheet() {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];
  const [{ complete, step }, setProductsOnBoardingTrigger] = useState({
    complete: true,
    step: -1
  });

  const [{ products: productsOnBoardingTrigger }, setUserOnBoardingTriggerState] = useRecoilState(
    userOnBoardingTriggerState
  );
  const [{ open }, setProductsMapFilterState] = useRecoilState(
    productsFilterStateFamily(`map-${atomParam}`)
  );
  const [{ searchParams }, setSearchParamsState] = useRecoilState(
    searchParamsStateFamily(`search-${atomParam}`)
  );
  const setSearchOptionsParamsState = useSetRecoilState(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );
  const setSelectedOptionsState = useSetRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );

  const queryClient = useQueryClient();
  const { data: accessUser } = useQueryAccessUser();

  const { data: { area: { values = [] } = {} } = {} } = useQuery(
    queryKeys.users.userInfo(),
    fetchUserInfo,
    {
      enabled: !!accessUser
    }
  );

  const [activeIndex, setActiveIndex] = useState(0);

  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!values.length) return;

    const dataIndex = Number(e.currentTarget.getAttribute('data-index') || 0);

    if (!Number.isNaN(dataIndex)) {
      const newActiveIndex = dataIndex === activeIndex ? 0 : dataIndex;
      const selectedMapFilterOption = mapFilterOptions.find(({ index }) => index === dataIndex);

      if (selectedMapFilterOption && newActiveIndex) {
        logEvent(attrKeys.products.SELECT_MAP_FILTER, {
          name: PRODUCT_NAME.PRODUCT_LIST,
          att: selectedMapFilterOption.viewName
        });
      } else if (selectedMapFilterOption && !newActiveIndex) {
        logEvent(attrKeys.products.SELECT_MAP_FILTER, {
          name: PRODUCT_NAME.PRODUCT_LIST,
          att: 'OFF'
        });
      }

      setActiveIndex(newActiveIndex);
    }
  };

  const handleClickLocationInputAlert = () => {
    if (!complete && step === 3) return;

    if (!accessUser) {
      logEvent(attrKeys.products.CLICK_LOGIN, {
        name: 'FILTER_MAP_MODAL'
      });
      router.push({ pathname: '/login', query: { returnUrl: '/user/addressInput' } });
      return;
    }

    const isNew = accessUser && !values.filter(({ isActive }) => isActive).length;

    logEvent(attrKeys.products.CLICK_PERSONAL_INPUT, {
      name: 'FILTER_MAP_MODAL',
      att: isNew ? 'NEW' : 'EDIT'
    });

    router.push('/user/addressInput');
  };

  const handleClickApply = () => {
    const activeMapFilter = mapFilterOptions.find(
      (mapFilterOption) => mapFilterOption.index === activeIndex
    );

    if (activeMapFilter) {
      logEvent(attrKeys.products.CLICK_APPLY_MAPFILTER);

      const { distance } = activeMapFilter;

      setSelectedOptionsState(({ type, selectedSearchOptions: prevSelectedSearchOptions }) => ({
        type,
        selectedSearchOptions: [
          ...prevSelectedSearchOptions.filter(({ codeId }) => codeId !== filterCodeIds.map),
          {
            codeId: filterCodeIds.map,
            distance
          }
        ]
      }));
      setSearchParamsState(({ type, searchParams: prevSearchParams }) => ({
        type,
        searchParams: {
          ...prevSearchParams,
          distance
        }
      }));
      setSearchOptionsParamsState(({ type, searchParams: prevSearchParams }) => ({
        type,
        searchParams: {
          ...prevSearchParams,
          distance
        }
      }));
    }

    setProductsMapFilterState(({ type }) => ({
      type,
      open: false
    }));

    queryClient.invalidateQueries(queryKeys.products.search(searchParams));
  };

  const handleClose = () => {
    setProductsMapFilterState(({ type }) => ({
      type,
      open: false
    }));

    if (!complete && step === 3) {
      setUserOnBoardingTriggerState((prevState) => ({
        ...prevState,
        products: {
          complete: true,
          step: 4
        }
      }));
    }
  };

  useEffect(() => {
    if (!complete && step === 3) {
      setActiveIndex(3);
    } else {
      setActiveIndex(
        (
          mapFilterOptions.find(
            (mapFilterOption) => mapFilterOption.distance === searchParams.distance
          ) || {}
        ).index || 0
      );
    }
  }, [searchParams.distance, open, complete, step]);

  useEffect(() => {
    setProductsOnBoardingTrigger(productsOnBoardingTrigger);
  }, [productsOnBoardingTrigger]);

  useEffect(() => {
    if (open) {
      logEvent(attrKeys.products.VIEW_MAP_FILTER);
    }
  }, [open]);

  return (
    <BottomSheet disableSwipeable open={open} onClose={handleClose}>
      <Tooltip
        open={!complete && step === 3}
        brandColor="primary-highlight"
        message={
          <Typography variant="body2" weight="bold">
            위치 정보를 입력 후에 당근마켓 매물도 볼 수 있어요 🥕
          </Typography>
        }
        placement="top"
        customStyle={{ position: 'fixed', top: -10, height: 34, zIndex: 1000000 }}
      />
      <Flexbox
        justifyContent="space-between"
        customStyle={{ margin: '16px 20px 0 20px', textAlign: 'right' }}
      >
        <Typography variant="h4" weight="bold">
          거리 설정
        </Typography>
        <Icon name="CloseOutlined" size="large" onClick={handleClose} />
      </Flexbox>
      <Alert
        brandColor="primary-highlight"
        customStyle={{
          margin: '24px 20px'
        }}
        onClick={handleClickLocationInputAlert}
      >
        {!complete && step === 3 ? (
          <Flexbox
            alignment="center"
            justifyContent="space-between"
            customStyle={{
              padding: '12px 20px',
              cursor: 'pointer'
            }}
          >
            <Typography variant="body2">서울시 용산구 동자동</Typography>
            <LocationInputButton>
              <Typography variant="small2" customStyle={{ color: common.grey['60'] }}>
                로그인
              </Typography>
              <Icon name="CaretRightOutlined" size="small" color={common.grey['40']} />
            </LocationInputButton>
          </Flexbox>
        ) : (
          <Flexbox
            alignment="center"
            justifyContent="space-between"
            customStyle={{
              padding: '12px 20px',
              cursor: 'pointer'
            }}
          >
            {!accessUser && (
              <Typography variant="body2">로그인 후 위치 정보가 필요해요!</Typography>
            )}
            {accessUser && values.length === 0 && (
              <Typography variant="body2">위치 정보가 필요해요!</Typography>
            )}
            {accessUser &&
              values
                .filter(({ isActive }) => isActive)
                .map(({ id, areaName }) => (
                  <Typography key={`user-area-${id}`} variant="body2">
                    {areaName}
                  </Typography>
                ))}
            <LocationInputButton>
              <Typography variant="small2" customStyle={{ color: common.grey['60'] }}>
                {!accessUser ? '로그인' : '위치 입력하기'}
              </Typography>
              <Icon name="CaretRightOutlined" size="small" color={common.grey['40']} />
            </LocationInputButton>
          </Flexbox>
        )}
      </Alert>
      <Flexbox component="section" customStyle={{ marginBottom: 24, padding: '0 4px' }}>
        {mapFilterOptions.map(({ name, distance, index: mapFilterIndex }, index) => (
          <Flexbox
            key={`map-filter-${mapFilterIndex}`}
            gap={18}
            direction="vertical"
            customStyle={{ flexGrow: 1 }}
            data-index={mapFilterIndex}
            onClick={handleClick}
          >
            <Flexbox customStyle={{ flexGrow: 1 }}>
              <StepBar isActive={index + 1 <= activeIndex} hideBar={index === 0} hideAfter />
              <StepBar
                isActive={index + 1 <= activeIndex}
                isLastActive={index + 1 === activeIndex}
                hideBar={index === 4}
              />
            </Flexbox>
            <Flexbox
              direction="vertical"
              alignment="center"
              customStyle={{
                height: 36,
                margin: 'auto',
                justifyContent: 'flex-start',
                cursor: 'pointer'
              }}
            >
              <Typography
                variant="small1"
                weight="bold"
                customStyle={{
                  color: index + 1 <= activeIndex ? primary.main : common.grey['80']
                }}
              >
                {name}
              </Typography>
              {distance > 0 && (
                <Typography
                  variant="small1"
                  weight="bold"
                  customStyle={{
                    color: index + 1 <= activeIndex ? primary.main : common.grey['80']
                  }}
                >
                  {distance}km
                </Typography>
              )}
            </Flexbox>
          </Flexbox>
        ))}
      </Flexbox>
      <Flexbox
        component="section"
        direction="vertical"
        gap={16}
        customStyle={{ marginBottom: 32, textAlign: 'center' }}
      >
        <Typography
          variant="body2"
          weight="medium"
          customStyle={{
            color: common.grey['40']
          }}
        >
          {getMessageByActiveIndex(activeIndex)}
        </Typography>
        {!complete && step === 3 ? (
          <CtaButton
            variant="contained"
            brandColor="primary"
            size="large"
            fullWidth
            customStyle={{ maxWidth: 200, margin: 'auto' }}
            onClick={handleClose}
          >
            적용하기
          </CtaButton>
        ) : (
          <CtaButton
            variant="contained"
            brandColor="primary"
            size="large"
            fullWidth
            customStyle={{ maxWidth: 200, margin: 'auto' }}
            onClick={handleClickApply}
            disabled={activeIndex === 0 || !values.length}
          >
            적용하기
          </CtaButton>
        )}
      </Flexbox>
    </BottomSheet>
  );
}

const LocationInputButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StepBar = styled.div<{
  isActive?: boolean;
  isLastActive?: boolean;
  hideBar?: boolean;
  hideAfter?: boolean;
}>`
  width: 100%;
  height: 2px;
  cursor: pointer;

  ${({
    theme: {
      palette: { common }
    },
    hideBar
  }): CSSObject =>
    !hideBar
      ? {
          backgroundColor: common.grey['80']
        }
      : {}}

  ${({
    theme: {
      palette: { primary }
    },
    hideBar,
    isActive
  }): CSSObject =>
    isActive && !hideBar
      ? {
          backgroundColor: primary.main
        }
      : {}}

  ${({
    theme: {
      palette: { common }
    },
    hideBar,
    isLastActive
  }): CSSObject =>
    isLastActive && !hideBar
      ? {
          backgroundColor: common.grey['80']
        }
      : {}}

  ${({
    theme: {
      palette: { primary, common }
    },
    isActive,
    hideAfter
  }): CSSObject =>
    !hideAfter
      ? {
          '&:after': {
            position: 'absolute',
            content: '""',
            display: 'block',
            width: 16,
            height: 16,
            borderRadius: '50%',
            border: `2px solid ${isActive ? primary.main : common.grey['80']}`,
            backgroundColor: isActive ? primary.main : common.white,
            transform: 'translate(-50%, -40%)'
          }
        }
      : {}}
`;

export default ProductsMapFilterBottomSheet;
