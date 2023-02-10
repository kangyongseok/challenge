import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { BottomSheet, Box, Button, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import { debounce } from 'lodash-es';
import { useMutation, useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { TextInput } from '@components/UI/molecules';
import { CamelSellerProductSearchItem } from '@components/pages/camelSeller';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { postPreReserve } from '@api/user';
import { fetchModelSuggest } from '@api/model';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { PreReserveCheckState, PreReserveDataState, SuccessDialogState } from '@recoil/myPortfolio';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import MyPortfolioCheckboxLabel from './MyPortfolioCheckboxLabel';

const checkData = [
  { label: '중고 실거래가', value: 'REAL_PRICE' },
  { label: '인기도 측정', value: 'POPULARITY' },
  { label: '판매속도 예측', value: 'SALES_SPEED' }
];

interface preReserve {
  reserveData: {
    model: string;
    phone: string;
  };
  checkList: string[];
}

function MyPortfolioBottomSheet({
  innerHeight,
  onClick,
  openReservation
}: {
  innerHeight: number;
  onClick: () => void;
  openReservation: boolean;
}) {
  const router = useRouter();
  const {
    theme: {
      palette: { secondary, common },
      typography
    }
  } = useTheme();
  const { data: accessUser } = useQueryAccessUser();
  const [searchValue, setSearchValue] = useState('');
  const [searchValue2, setSearchValue2] = useState('');
  const [openSearchList, setOpenSearchList] = useState(false);
  const [checkList, setCheckList] = useRecoilState(PreReserveCheckState);
  const [reserveData, setReserveData] = useRecoilState(PreReserveDataState);
  const [validatorText, setValidatorText] = useState('');
  const [phone, setPhone] = useState('');
  const { mutate: mutatePostManage } = useMutation(postPreReserve);
  const successDialog = useSetRecoilState(SuccessDialogState);

  const { data: models, refetch } = useQuery(
    queryKeys.models.suggest({ keyword: searchValue2 }),
    () => fetchModelSuggest({ keyword: searchValue2 }),
    {
      enabled: false
    }
  );

  useEffect(() => {
    if (accessUser && accessUser.phone) {
      setReserveData((props) => ({ ...props, phone: accessUser.phone }));
    }
  }, [accessUser, setReserveData]);

  useEffect(() => {
    if (openReservation) {
      logEvent(attrKeys.myPortfolio.VIEW_MYPORTFOLIO_MODAL, {
        name: attrProperty.productName.MYPORTFOLIO
      });
    }
  }, [openReservation]);

  useEffect(() => {
    if (router.query.login) {
      const localData = LocalStorage.get('preReserve') as preReserve;
      const postData = LocalStorage.get('preReserve') ? localData.reserveData : reserveData;
      if (accessUser?.phone) {
        postData.phone = accessUser?.phone;
      }

      logEvent(attrKeys.myPortfolio.CLICK_RESERVATION, {
        name: attrProperty.productName.MYPORTFOLIO_MODAL,
        model: postData.model,
        checkList: localData?.checkList || [],
        att: 'LOGIN'
      });

      mutatePostManage(postData, {
        onSuccess() {
          logEvent(attrKeys.myPortfolio.VIEW_MYPORTFOLIO_MODAL, {
            name: attrProperty.productName.MYPORTFOLIO
          });
          successDialog(true);
        }
      });
    }
    return () => {
      successDialog(false);
      setValidatorText('');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchValue2) {
      refetch();
    }
  }, [refetch, searchValue2]);

  const searchChagne = debounce((e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchValue2(value);
  }, 500);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setReserveData((props) => ({ ...props, model: e.target.value }));
    if (!openSearchList) {
      setOpenSearchList(true);
    }
    setSearchValue(value);
  };

  const handleChecked = (value: string) => {
    if (checkList.includes(value)) {
      const result = checkList.filter((cheked) => cheked !== value);
      setCheckList(result);
    } else {
      setCheckList((props) => [...props, value]);
    }
  };

  const handleChangePhone = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    if (target.value.length <= 11) {
      setValidatorText('');
      setPhone(target.value);
      setReserveData((props) => ({ ...props, phone: target.value }));
    }
  };

  const handleFocus = () => {
    if (reserveData.model) {
      setReserveData((props) => ({ ...props, model: '' }));
    }
  };

  const handleClickReserve = () => {
    const regPhone = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
    logEvent(attrKeys.myPortfolio.CLICK_RESERVATION, {
      name: attrProperty.productName.MYPORTFOLIO_MODAL,
      model: reserveData.model,
      checkList
    });

    if (accessUser?.phone) {
      mutatePostManage(reserveData, {
        onSuccess() {
          successDialog(true);
          setCheckList([]);
          setReserveData({ model: '', phone: '' });
        }
      });
    }

    if (!phone) setValidatorText('휴대전화번호 입력은 필수입니다.');
    if (phone && !regPhone.test(phone)) setValidatorText('형식에 맞춰 숫자만 입력해주세요.');
    if (phone && regPhone.test(phone)) {
      mutatePostManage(reserveData, {
        onSuccess() {
          setCheckList([]);
          setReserveData({ model: '', phone: '' });
          successDialog(true);
        }
      });
    }
  };

  const handleClickLogin = () => {
    logEvent(attrKeys.myPortfolio.CLICK_RESERVATION_LOGIN, {
      name: attrProperty.productName.MYPORTFOLIO_MODAL
    });

    const regPhone = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
    if (!phone) setValidatorText('휴대전화번호 입력은 필수입니다.');
    if (phone && !regPhone.test(phone)) setValidatorText('형식에 맞춰 숫자만 입력해주세요.');
    if (phone && regPhone.test(phone)) {
      LocalStorage.set('preReserve', { reserveData, checkList });
      router.push({
        pathname: '/login',
        query: { returnUrl: `${router.asPath}?login=success` }
      });
    }
  };

  const handleClose = () => {
    reset();
    onClick();
  };

  const reset = () => {
    setSearchValue('');
    setSearchValue2('');
    setPhone('');
    setCheckList([]);
    setReserveData({ model: '', phone: '' });
    setValidatorText('');
  };

  return (
    <BottomSheet open={openReservation} onClose={handleClose}>
      <Box customStyle={{ height: innerHeight - 100 }}>
        <Box
          customStyle={{
            borderBottom: `1px solid ${common.ui90}`,
            textAlign: 'center',
            padding: '10px 20px 32px'
          }}
        >
          <Typography variant="h3" weight="bold" customStyle={{ marginBottom: 4 }}>
            MY PORTFOLIO 사전예약
          </Typography>
          <Typography>모델명을 입력하면</Typography>
          <Typography>내 명품의 보고서를 가장 빠르게 알려드려요!</Typography>
        </Box>
        <Flexbox
          customStyle={{
            padding: '32px 20px',
            height: 'calc(100% - 115px)',
            overflow: 'auto'
          }}
          direction="vertical"
          gap={20}
        >
          {!accessUser?.phone && (
            <Flexbox gap={8} direction="vertical">
              <Typography weight="medium" customStyle={{ color: common.ui60 }}>
                휴대전화번호
              </Typography>
              <TextInput
                placeholder="010-"
                borderWidth={1}
                variant="outline"
                onChange={handleChangePhone}
                type="number"
                pattern="[0-9]*"
                inputMode="numeric"
                value={phone}
                inputStyle={{ fontSize: typography.h4.size, width: '100%' }}
                customStyle={{
                  padding: '12px 16px',
                  height: 48,
                  border: `1px solid ${validatorText ? secondary.red.main : '#E6E6E6'}`
                }}
              />
              {validatorText && (
                <Typography variant="body2" brandColor="red">
                  {validatorText}
                </Typography>
              )}
            </Flexbox>
          )}
          <Flexbox gap={8} direction="vertical" customStyle={{ position: 'relative' }}>
            <Typography weight="medium" customStyle={{ color: common.ui60 }}>
              모델명 (선택)
            </Typography>
            <TextInput
              borderWidth={1}
              variant="outline"
              placeholder="모델명 입력"
              onChange={(e) => {
                handleChange(e);
                searchChagne(e);
              }}
              onFocus={handleFocus}
              value={reserveData.model || searchValue}
              inputStyle={{ fontSize: typography.h4.size, width: '100%' }}
              customStyle={{ padding: '12px 16px', height: 48 }}
            />
            {models && models.length > 0 && openSearchList && searchValue && (
              <SearchResultArea>
                {models.map((result) => {
                  return (
                    <CamelSellerProductSearchItem
                      onClick={() => {
                        setSearchValue(result.name);
                        setOpenSearchList(false);
                        setReserveData((props) => ({ ...props, model: result.name }));
                      }}
                      key={`camel-seller-product-${result.name}`}
                      data={result}
                    />
                  );
                })}
              </SearchResultArea>
            )}
          </Flexbox>
          <Flexbox direction="vertical" gap={18}>
            <Typography weight="medium" customStyle={{ color: common.ui60 }}>
              어떤 기능이 제일 기대되나요? (선택)
            </Typography>
            <MyPortfolioCheckboxLabel onChange={handleChecked} data={checkData} />
          </Flexbox>
          <Box customStyle={{ marginTop: 'auto' }}>
            {accessUser ? (
              <GradationCtaButton
                variant="solid"
                fullWidth
                size="large"
                onClick={handleClickReserve}
              >
                MY PORTFOLIO 사전예약
              </GradationCtaButton>
            ) : (
              <KakaoCtaButton
                variant="solid"
                size="large"
                fullWidth
                startIcon={<Icon name="KakaoFilled" />}
                onClick={handleClickLogin}
              >
                카카오톡으로 사전예약하기
              </KakaoCtaButton>
            )}
          </Box>
        </Flexbox>
      </Box>
    </BottomSheet>
  );
}

const GradationCtaButton = styled(Button)`
  background: linear-gradient(90deg, #1833ff 0%, #5800e5 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
`;

const KakaoCtaButton = styled(Button)`
  background: #fee500;
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui20};
  svg {
    color: ${({
      theme: {
        palette: { common }
      }
    }) => common.ui20};
  }
`;

const SearchResultArea = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: auto;
  max-height: 183px;
  position: absolute;
  top: 85px;
  left: 0;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  width: 100%;
  padding: 20px;
`;

export default MyPortfolioBottomSheet;
