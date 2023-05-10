import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import type { AxiosError } from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  BottomSheet,
  Box,
  Button,
  Dialog,
  Flexbox,
  Icon,
  Input,
  Switch,
  Toast,
  Typography,
  useTheme
} from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import { fetchUserKeywords, postUserKeywords, putUserKeywords } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import {
  keywordAlertIsSetupMySizeState,
  keywordAlertManageBottomSheetState,
  keywordAlertOffDialogOpenState
} from '@recoil/keywordAlert';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

interface KeywordAlertManageBottomSheetProps {
  name?: string;
  title?: string;
}

function KeywordAlertManageBottomSheet({ name, title }: KeywordAlertManageBottomSheetProps) {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [openDialog, setOpenDialog] = useState(false);
  const [openToast, setOpenToast] = useState(false);
  const [openPutToast, setOpenPutToast] = useState(false);

  const [
    { open, id, keyword, minPrice, maxPrice, isMySize },
    setKeywordAlertManageBottomSheetState
  ] = useRecoilState(keywordAlertManageBottomSheetState);
  const setKeywordAlertOffOpenState = useSetRecoilState(keywordAlertOffDialogOpenState);
  const [isSetupMySize, setIsSetupMySizeState] = useRecoilState(keywordAlertIsSetupMySizeState);
  const resetKeywordAlertManageBottomSheetState = useResetRecoilState(
    keywordAlertManageBottomSheetState
  );

  const { refetch } = useQuery(queryKeys.users.userKeywords(), () => fetchUserKeywords());

  const {
    data: { size: { value: { tops = [], bottoms = [], shoes = [] } = {} } = {} } = {},
    isLoading
  } = useQueryUserInfo();

  const { mutate } = useMutation(postUserKeywords);
  const { mutate: mutatePut } = useMutation(putUserKeywords);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name: currentTargetName, value } = e.currentTarget;

    setKeywordAlertManageBottomSheetState((prevState) => ({
      ...prevState,
      [currentTargetName]: Number(value.replace(/[^0-9]/g, ''))
    }));
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    if (!minPrice || !maxPrice) return;

    const { name: currentTargetName } = e.currentTarget;

    if (currentTargetName === 'minPrice' && minPrice > maxPrice) {
      setKeywordAlertManageBottomSheetState((prevState) => ({
        ...prevState,
        [currentTargetName]: maxPrice
      }));
      return;
    }
    if (currentTargetName === 'maxPrice' && maxPrice < minPrice) {
      setKeywordAlertManageBottomSheetState((prevState) => ({
        ...prevState,
        [currentTargetName]: minPrice
      }));
    }
  };

  const handleChangeMySize = () => {
    if (!tops.length && !bottoms.length && !shoes.length) {
      router.push('/user/sizeInput').then(() => setIsSetupMySizeState(true));
    } else {
      setKeywordAlertManageBottomSheetState((prevState) => ({
        ...prevState,
        isMySize: !prevState.isMySize
      }));
    }
  };

  const handleClickReset = () =>
    setKeywordAlertManageBottomSheetState((prevState) => ({
      ...prevState,
      minPrice: 0,
      maxPrice: 0
    }));

  const handleClick = () => {
    if (name === 'PRODUCT_LIST') {
      logEvent(attrKeys.products.SUBMIT_KEYWORD_ALERT, {
        name,
        title,
        keyword
      });
    } else {
      logEvent(attrKeys.products.SUBMIT_KEYWORD_ALERT, {
        name,
        title,
        keyword,
        minPrice,
        maxPrice,
        isMySize,
        att: id ? 'EDIT' : 'CREATE'
      });
    }

    // att: CREATE | EDIT, keyword, minPrice, maxPrice, isMySize

    if (id) {
      mutatePut(
        {
          id,
          keyword,
          minPrice: Number(minPrice || 0) * 10000,
          maxPrice: Number(maxPrice || 0) * 10000,
          isMySize
        },
        {
          async onSuccess() {
            await refetch();
            resetKeywordAlertManageBottomSheetState();
            setOpenPutToast(true);
          },
          onError(error) {
            const { response } = error as AxiosError;
            if (response?.status === 400) {
              setOpenDialog(true);
            } else if (response?.status === 403) {
              setKeywordAlertOffOpenState(true);
            }
          }
        }
      );
    } else {
      mutate(
        {
          keyword,
          minPrice: Number(minPrice || 0) * 10000,
          maxPrice: Number(maxPrice || 0) * 10000,
          isMySize
        },
        {
          async onSuccess() {
            await refetch();
            resetKeywordAlertManageBottomSheetState();
            setOpenToast(true);
          },
          onError(error) {
            const { response } = error as AxiosError;
            if (response?.status === 400) {
              setOpenDialog(true);
            } else if (response?.status === 403) {
              setKeywordAlertOffOpenState(true);
            }
          }
        }
      );
    }
  };

  useEffect(() => {
    if (open) {
      setOpenToast(false);
      setOpenPutToast(false);
    }
  }, [open]);

  useEffect(() => {
    if (isSetupMySize && (tops.length || bottoms.length || shoes.length)) {
      setKeywordAlertManageBottomSheetState((prevState) => ({
        ...prevState,
        isMySize: true
      }));
      setIsSetupMySizeState(false);
    }
  }, [
    isSetupMySize,
    setIsSetupMySizeState,
    setKeywordAlertManageBottomSheetState,
    tops,
    bottoms,
    shoes
  ]);

  return (
    <>
      <BottomSheet
        open={open}
        onClose={() => resetKeywordAlertManageBottomSheetState()}
        disableSwipeable
      >
        <Flexbox
          justifyContent="space-between"
          customStyle={{
            padding: '16px 20px',
            borderBottom: `1px solid ${common.line01}`
          }}
        >
          <Typography variant="h3" weight="bold">
            키워드 알림 등록
          </Typography>
          <Icon name="CloseOutlined" onClick={() => resetKeywordAlertManageBottomSheetState()} />
        </Flexbox>
        <Box
          customStyle={{
            padding: '32px 20px 20px'
          }}
        >
          <Typography variant="h2" weight="bold">
            {keyword}
          </Typography>
          <Flexbox
            justifyContent="space-between"
            customStyle={{
              marginTop: 32
            }}
          >
            <Typography variant="h4" weight="medium">
              가격제한
            </Typography>
            <Button
              variant="inline"
              brandColor="black"
              startIcon={<Icon name="RotateOutlined" color="ui60" />}
              onClick={handleClickReset}
              disablePadding
              customStyle={{
                color: common.ui60
              }}
            >
              초기화
            </Button>
          </Flexbox>
          <Flexbox
            gap={8}
            alignment="center"
            customStyle={{
              marginTop: 8
            }}
          >
            <Input
              size="large"
              fullWidth
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              name="minPrice"
              onChange={handleChange}
              onBlur={handleBlur}
              value={minPrice || ''}
              unit="만원"
              placeholder="0"
            />
            <Typography variant="h4">~</Typography>
            <Input
              size="large"
              fullWidth
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              name="maxPrice"
              onChange={handleChange}
              onBlur={handleBlur}
              value={maxPrice || ''}
              unit="만원"
              placeholder="0"
            />
          </Flexbox>
          <Flexbox
            justifyContent="space-between"
            alignment="center"
            customStyle={{
              marginTop: 32
            }}
          >
            <Flexbox direction="vertical" gap={4}>
              <Typography weight="medium">내 사이즈</Typography>
              <Typography variant="body2" color="ui60">
                내 사이즈에 맞는 매물만 알림을 받습니다.
              </Typography>
            </Flexbox>
            <Switch
              size="large"
              onChange={handleChangeMySize}
              checked={isMySize}
              disabled={isLoading}
            />
          </Flexbox>
          <Button
            variant="solid"
            brandColor="black"
            size="xlarge"
            fullWidth
            onClick={handleClick}
            disabled={!keyword}
            customStyle={{
              marginTop: 52
            }}
          >
            {id ? '확인' : '키워드 등록'}
          </Button>
        </Box>
      </BottomSheet>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        customStyle={{
          paddingTop: 32,
          maxWidth: 311
        }}
      >
        <Typography variant="h3" weight="bold" textAlign="center">
          키워드는 최대 50개까지 등록 가능해요
        </Typography>
        <Typography
          textAlign="center"
          customStyle={{
            marginTop: 8
          }}
        >
          등록된 키워드를 변경하거나 삭제해주세요.
        </Typography>
        <Button
          variant="solid"
          brandColor="black"
          size="large"
          fullWidth
          onClick={() => setOpenDialog(false)}
          customStyle={{
            marginTop: 32
          }}
        >
          확인
        </Button>
      </Dialog>
      <Toast
        open={openToast}
        onClose={() => setOpenToast(false)}
        customStyle={{
          padding: router.pathname !== '/mypage/settings/keywordAlert' ? 12 : undefined
        }}
      >
        <Flexbox
          justifyContent={
            router.pathname !== '/mypage/settings/keywordAlert' ? 'space-between' : 'center'
          }
        >
          <Typography weight="medium" color="uiWhite">
            키워드 알림이 등록되었어요.
          </Typography>
          {router.pathname !== '/mypage/settings/keywordAlert' && (
            <Typography
              weight="medium"
              color="ui80"
              onClick={() => router.push('/mypage/settings/keywordAlert')}
              customStyle={{
                textDecoration: 'underline'
              }}
            >
              자세히보기
            </Typography>
          )}
        </Flexbox>
      </Toast>
      <Toast open={openPutToast} onClose={() => setOpenPutToast(false)}>
        키워드 알림이 수정되었어요.
      </Toast>
    </>
  );
}

export default KeywordAlertManageBottomSheet;
