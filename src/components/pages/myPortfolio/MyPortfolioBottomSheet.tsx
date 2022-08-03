import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { BottomSheet, Box, CtaButton, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import { debounce } from 'lodash-es';
import styled from '@emotion/styled';

import { TextInput } from '@components/UI/molecules';
import { ProductSearchItem } from '@components/pages/camelSeller';

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
    theme: { palette, typography }
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
    queryKeys.model.keyword(searchValue2),
    () =>
      fetchModelSuggest({
        keyword: searchValue2
      }),
    {
      enabled: false
    }
  );

  useEffect(() => {
    logEvent(attrKeys.myPortfolio.VIEW_MYPORTFOLIO_MODAL, {
      name: attrProperty.productName.MYPORTFOLIO
    });
    if (router.query.login) {
      const localData = LocalStorage.get('preReserve') as preReserve;
      const postData = LocalStorage.get('preReserve') ? localData.reserveData : reserveData;
      if (accessUser?.phone) {
        postData.phone = accessUser?.phone;
      }
      mutatePostManage(postData, {
        onSuccess() {
          successDialog(true);
        }
      });
    }
    return () => {
      successDialog(false);
      setValidatorText('');
      LocalStorage.remove('preReserve');
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
      att: checkList
    });

    if (!phone) setValidatorText('휴대전화번호 입력은 필수입니다.');
    if (phone && !regPhone.test(phone)) setValidatorText('형식에 맞춰 숫자만 입력해주세요.');
    if (phone && regPhone.test(phone)) {
      mutatePostManage(reserveData, {
        onSuccess() {
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

  return (
    <BottomSheet open={openReservation} onClose={onClick}>
      <Box customStyle={{ height: innerHeight - 100 }}>
        <Box
          customStyle={{
            borderBottom: `1px solid ${palette.common.grey['90']}`,
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
              <Typography weight="medium" customStyle={{ color: palette.common.grey['60'] }}>
                휴대전화번호
              </Typography>
              <TextInput
                placeholder="010-"
                borderWidth={1}
                variant="outlined"
                onChange={handleChangePhone}
                type="number"
                pattern="[0-9]*"
                inputMode="numeric"
                value={phone}
                inputStyle={{ fontSize: typography.h4.size }}
                customStyle={{
                  padding: '12px 16px',
                  height: 48,
                  border: `1px solid ${validatorText ? palette.secondary.red.main : '#E6E6E6'}`
                }}
              />
              {validatorText && (
                <Typography variant="small1" brandColor="red">
                  {validatorText}
                </Typography>
              )}
            </Flexbox>
          )}
          <Flexbox gap={8} direction="vertical" customStyle={{ position: 'relative' }}>
            <Typography weight="medium" customStyle={{ color: palette.common.grey['60'] }}>
              모델명 (선택)
            </Typography>
            <TextInput
              borderWidth={1}
              variant="outlined"
              placeholder="모델명 입력"
              onChange={(e) => {
                handleChange(e);
                searchChagne(e);
              }}
              onFocus={handleFocus}
              value={reserveData.model || searchValue}
              inputStyle={{ fontSize: typography.h4.size }}
              customStyle={{ padding: '12px 16px', height: 48 }}
            />
            {models && models.length > 0 && openSearchList && searchValue && (
              <SearchResultArea>
                {models.map((result) => (
                  <ProductSearchItem
                    onClick={() => {
                      setSearchValue(result.name);
                      setOpenSearchList(false);
                    }}
                    key={`camel-seller-product-${result.name}`}
                    data={result}
                  />
                ))}
              </SearchResultArea>
            )}
          </Flexbox>
          <Flexbox direction="vertical" gap={18}>
            <Typography weight="medium" customStyle={{ color: palette.common.grey['60'] }}>
              어떤 기능이 제일 기대되나요? (선택)
            </Typography>
            <MyPortfolioCheckboxLabel onChange={handleChecked} data={checkData} />
          </Flexbox>
          <Box customStyle={{ marginTop: 'auto' }}>
            {accessUser ? (
              <GradationCtaButton
                variant="contained"
                fullWidth
                size="large"
                onClick={handleClickReserve}
              >
                MY PORTFOLIO 사전예약
              </GradationCtaButton>
            ) : (
              <KakaoCtaButton
                variant="contained"
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

const GradationCtaButton = styled(CtaButton)`
  background: linear-gradient(90deg, #1833ff 0%, #5800e5 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  color: ${({ theme: { palette } }) => palette.common.white};
`;

const KakaoCtaButton = styled(CtaButton)`
  background: #fee500;
  color: ${({ theme: { palette } }) => palette.common.grey['20']};
  svg {
    color: ${({ theme: { palette } }) => palette.common.grey['20']};
  }
`;

const SearchResultArea = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: auto;
  max-height: 183px;
  overflow: auto;
  position: absolute;
  top: 85px;
  left: 0;
  background: ${({ theme: { palette } }) => palette.common.white};
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  width: 100%;
  padding: 20px;
`;

export default MyPortfolioBottomSheet;