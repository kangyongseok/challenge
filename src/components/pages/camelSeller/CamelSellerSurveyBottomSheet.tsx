import { useEffect, useRef, useState } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import {
  BottomSheet,
  Box,
  Button,
  Chip,
  Flexbox,
  Grid,
  Icon,
  Image,
  Skeleton,
  Toast,
  Typography,
  useTheme
} from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchCommonCodeDetails } from '@api/common';

import queryKeys from '@constants/queryKeys';
import {
  filterColors,
  filterImageColorNames,
  needReverseCheckFilterColorNames
} from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  camelSellerHasOpenedSurveyBottomSheetState,
  camelSellerPriceInputFocusState,
  camelSellerSurveyBottomSheetState,
  camelSellerSurveyFormOffsetTopState,
  camelSellerSurveyState,
  camelSellerSurveyValidatorState
} from '@recoil/camelSeller';
import useDebounce from '@hooks/useDebounce';

function CamelSellerSurveyBottomSheet() {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();

  const [{ open, step }, setOpen] = useRecoilState(camelSellerSurveyBottomSheetState);
  const [hasOpened, setHasOpened] = useRecoilState(camelSellerHasOpenedSurveyBottomSheetState);
  const [{ units, stores, distances, colors = [] }, setCamelSellerSurveyState] =
    useRecoilState(camelSellerSurveyState);
  const isValid = useRecoilValue(camelSellerSurveyValidatorState);
  const isFocus = useRecoilValue(camelSellerPriceInputFocusState);
  const surveyFormOffsetTop = useRecoilValue(camelSellerSurveyFormOffsetTopState);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgresses] = useState([0, 1, 2, 3]);
  const [openToast, setOpenToast] = useState(false);

  const openTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const nextStepDelayTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const onProgressNextStepDelayTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const onProgressNextStepDelayRef = useRef(false);

  const debouncedCurrentStep = useDebounce(currentStep, 300);

  const { data = [], isLoading } = useQuery(queryKeys.commons.codeDetails(3), () =>
    fetchCommonCodeDetails({
      codeId: 3
    })
  );

  const handleClick = () => {
    const getTitle = () => {
      if (currentStep === 1) {
        return 'STORE';
      }
      if (currentStep === 2) {
        return 'DISTANCE';
      }
      if (currentStep === 3) {
        return 'COLOR';
      }
      return 'UNIT';
    };
    logEvent(attrKeys.camelSeller.CLICK_SKIP, {
      name: attrProperty.name.PRODUCT_SURVEY,
      title: getTitle()
    });
    setOpen((prevState) => ({
      ...prevState,
      open: false
    }));
    window.scrollTo({
      top: surveyFormOffsetTop,
      behavior: 'smooth'
    });
  };

  const handleClickChip =
    ({
      type,
      id: newId,
      title,
      name
    }: {
      type: 'units' | 'stores' | 'distances';
      id: number;
      title: string;
      name: string;
    }) =>
    () => {
      logEvent(attrKeys.camelSeller.SELECT_ITEM, {
        name: attrProperty.name.PRODUCT_SURVEY,
        title,
        att: name
      });

      if (onProgressNextStepDelayRef.current) return;

      setCamelSellerSurveyState((prevState) => ({
        ...prevState,
        [type]: prevState[type].map((prevData) => ({
          ...prevData,
          selected: prevData.id === newId ? !prevData.selected : false
        }))
      }));
      const newStep = currentStep + 1;

      if (newStep > stepProgresses.length - 1) {
        setOpen((prevState) => ({
          ...prevState,
          open: false
        }));
        window.scrollTo({
          top: surveyFormOffsetTop,
          behavior: 'smooth'
        });
      } else {
        if (nextStepDelayTimerRef.current) {
          clearTimeout(nextStepDelayTimerRef.current);
        }

        if (onProgressNextStepDelayTimerRef.current) {
          clearTimeout(onProgressNextStepDelayTimerRef.current);
        }

        onProgressNextStepDelayRef.current = true;

        nextStepDelayTimerRef.current = setTimeout(() => {
          setCurrentStep(newStep);
          onProgressNextStepDelayTimerRef.current = setTimeout(() => {
            onProgressNextStepDelayRef.current = false;
          }, 300);
        }, 300);
      }
    };

  const handleClickColor =
    ({ id, name, description }: { id: number; name: string; description: string }) =>
    () => {
      logEvent(attrKeys.camelSeller.SELECT_ITEM, {
        name: attrProperty.name.PRODUCT_SURVEY,
        title: attrProperty.title.COLOR,
        att: name
      });

      const hasSelectedColor = colors.some(({ id: colorId }) => colorId === id);

      if (colors.length === 3 && !hasSelectedColor) {
        setOpenToast(true);
      } else {
        setCamelSellerSurveyState((prevState) => ({
          ...prevState,
          colors: hasSelectedColor
            ? prevState.colors.filter(({ id: colorId }) => colorId !== id)
            : prevState.colors.concat({
                id,
                name,
                description
              })
        }));
      }
    };

  const handleClose = () => {
    const getTitle = () => {
      if (currentStep === 1) {
        return 'STORE';
      }
      if (currentStep === 2) {
        return 'DISTANCE';
      }
      if (currentStep === 3) {
        return 'COLOR';
      }
      return 'UNIT';
    };
    logEvent(attrKeys.camelSeller.CLICK_SKIP, {
      name: attrProperty.name.PRODUCT_SURVEY,
      title: getTitle()
    });
    setOpen({
      step: 0,
      open: false
    });
    window.scrollTo({
      top: surveyFormOffsetTop,
      behavior: 'smooth'
    });
  };

  const handleClickComplete = () => {
    setCurrentStep(0);
    setOpen({
      step: 0,
      open: false
    });
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const hasSelectedUnits = !!units.filter(({ selected }) => selected).length;
    const hasSelectedStore = !!stores.filter(({ selected }) => selected).length;
    const hasSelectedDistance = !!distances.filter(({ selected }) => selected).length;

    if (
      hasOpened ||
      isFocus ||
      hasSelectedUnits ||
      hasSelectedStore ||
      hasSelectedDistance ||
      !!colors.length
    )
      return;

    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
    }

    // 사이즈, 상태를 마지막에 선택하는 경우 본 BottomSheet 오픈이 무시됨
    // 사이즈, 상태 선택 BottomSheet 가 닫히는 타이망과 겹치는게 문제인 듯
    // 임시 처리
    // TODO BottomSheet 동시성 관련 개선
    openTimerRef.current = setTimeout(() => {
      setOpen({
        step: 0,
        open: isValid
      });
    }, 500);
    if (isValid) setHasOpened(true);
  }, [setOpen, setHasOpened, hasOpened, isValid, isFocus, units, stores, distances, colors]);

  useEffect(() => {
    return () => {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
      }
      if (nextStepDelayTimerRef.current) {
        clearTimeout(nextStepDelayTimerRef.current);
      }
      if (onProgressNextStepDelayTimerRef.current) {
        clearTimeout(onProgressNextStepDelayTimerRef.current);
      }
    };
  }, []);

  useEffect(() => setCurrentStep(step), [step]);

  useEffect(() => {
    if (open && !step) {
      const getTitle = () => {
        if (currentStep === 1) {
          return 'STORE';
        }
        if (currentStep === 2) {
          return 'DISTANCE';
        }
        if (currentStep === 3) {
          return 'COLOR';
        }
        return 'UNIT';
      };
      logEvent(attrKeys.camelSeller.VIEW_PRODUCT_SURVEY, {
        name: attrProperty.name.PRODUCT_MAIN,
        title: getTitle()
      });
    }
  }, [open, step, currentStep]);

  useEffect(() => {
    if (open && step === 3) {
      logEvent(attrKeys.camelSeller.VIEW_PRODUCT_SURVEY, {
        name: attrProperty.name.PRODUCT_MAIN,
        title: 'COLOR'
      });
    }
  }, [open, step]);

  return (
    <>
      <BottomSheet
        fullScreen={debouncedCurrentStep === 3}
        open={open}
        onClose={handleClose}
        disableSwipeable
        customStyle={{
          padding: '32px 20px'
        }}
      >
        <Flexbox
          direction="vertical"
          customStyle={{
            height: '100%'
          }}
        >
          {debouncedCurrentStep === 0 && (
            <SurveyBox open={currentStep === 0}>
              <Typography
                customStyle={{
                  marginBottom: 8
                }}
              >
                구매자들이 궁금해하는 정보를 입력해주세요.
              </Typography>
              <Flexbox justifyContent="space-between" alignment="center" gap={4}>
                <Typography variant="h2" weight="bold">
                  구성품이 있나요?
                </Typography>
                <Button
                  variant="inline"
                  disablePadding
                  onClick={handleClick}
                  customStyle={{
                    whiteSpace: 'nowrap'
                  }}
                >
                  건너뛰기
                </Button>
              </Flexbox>
              <Flexbox
                gap={8}
                customStyle={{
                  margin: '32px 0 12px',
                  flexWrap: 'wrap'
                }}
              >
                {units.map(({ id, name, selected }) => (
                  <Chip
                    key={`camel-seller-step-unit-${name}-${id}`}
                    variant={selected ? 'solid' : 'ghost'}
                    brandColor="black"
                    size="large"
                    isRound={false}
                    onClick={handleClickChip({ type: 'units', id, title: 'UNIT', name })}
                  >
                    {name}
                  </Chip>
                ))}
              </Flexbox>
            </SurveyBox>
          )}
          {debouncedCurrentStep === 1 && (
            <SurveyBox open={currentStep === 1}>
              <Typography
                customStyle={{
                  marginBottom: 8
                }}
              >
                구매자들이 궁금해하는 정보를 입력해주세요.
              </Typography>
              <Flexbox justifyContent="space-between" alignment="center" gap={4}>
                <Typography variant="h2" weight="bold">
                  어디서 구입하셨나요?
                </Typography>
                <Button
                  variant="inline"
                  disablePadding
                  onClick={handleClick}
                  customStyle={{
                    whiteSpace: 'nowrap'
                  }}
                >
                  건너뛰기
                </Button>
              </Flexbox>
              <Flexbox
                gap={8}
                customStyle={{
                  margin: '32px 0 12px',
                  flexWrap: 'wrap'
                }}
              >
                {stores.map(({ id, name, selected }) => (
                  <Chip
                    key={`camel-seller-step-store-${name}-${id}`}
                    variant={selected ? 'solid' : 'ghost'}
                    brandColor="black"
                    size="large"
                    isRound={false}
                    onClick={handleClickChip({ type: 'stores', id, title: 'STORE', name })}
                  >
                    {name}
                  </Chip>
                ))}
              </Flexbox>
            </SurveyBox>
          )}
          {debouncedCurrentStep === 2 && (
            <SurveyBox open={currentStep === 2}>
              <Typography
                customStyle={{
                  marginBottom: 8
                }}
              >
                구매자들이 궁금해하는 정보를 입력해주세요.
              </Typography>
              <Flexbox justifyContent="space-between" alignment="center" gap={4}>
                <Typography variant="h2" weight="bold">
                  직거래&택배거래 되나요?
                </Typography>
                <Button
                  variant="inline"
                  disablePadding
                  onClick={handleClick}
                  customStyle={{
                    whiteSpace: 'nowrap'
                  }}
                >
                  건너뛰기
                </Button>
              </Flexbox>
              <Flexbox
                gap={8}
                customStyle={{
                  margin: '32px 0 12px',
                  flexWrap: 'wrap'
                }}
              >
                {distances.map(({ id, name, selected }) => (
                  <Chip
                    key={`camel-seller-step-distance-${name}-${id}`}
                    variant={selected ? 'solid' : 'ghost'}
                    brandColor="black"
                    size="large"
                    isRound={false}
                    onClick={handleClickChip({ type: 'distances', id, title: 'DISTANCE', name })}
                  >
                    {name}
                  </Chip>
                ))}
              </Flexbox>
              <Typography
                customStyle={{
                  marginTop: 12,
                  color: common.ui60
                }}
              >
                직거래 또는 상관없음 선택시
                <br />
                마이페이지에서 설정한 위치로 노출됩니다.
              </Typography>
            </SurveyBox>
          )}
          {debouncedCurrentStep === 3 && (
            <>
              <SurveyBox
                open={currentStep === 3}
                css={{
                  paddingBottom: 32
                }}
              >
                <Typography
                  customStyle={{
                    marginBottom: 8
                  }}
                >
                  구매자들이 궁금해하는 정보를 입력해주세요.
                </Typography>
                <Flexbox justifyContent="space-between" alignment="baseline" gap={4}>
                  <Typography variant="h2" weight="bold">
                    가장 비슷한 색상을
                    <br />
                    최대 3개 선택해주세요.
                  </Typography>
                  {step === 0 && (
                    <Button
                      variant="inline"
                      disablePadding
                      onClick={handleClick}
                      customStyle={{
                        whiteSpace: 'nowrap'
                      }}
                    >
                      건너뛰기
                    </Button>
                  )}
                </Flexbox>
              </SurveyBox>
              <SurveyGrid open={currentStep === 3} container columnGap={12} rowGap={12}>
                {isLoading &&
                  Array.from({ length: 30 }).map((_, index) => (
                    <Grid // eslint-disable-next-line react/no-array-index-key
                      key={`sample-color-${index}`}
                      item
                      xs={5}
                    >
                      <Flexbox
                        direction="vertical"
                        alignment="center"
                        gap={4}
                        customStyle={{
                          height: 60,
                          textAlign: 'center'
                        }}
                      >
                        <Box
                          customStyle={{
                            width: 40,
                            height: 40,
                            backgroundColor: '#313438',
                            borderRadius: '50%'
                          }}
                        />
                        <Skeleton width={40} height={40} round="50%" disableAspectRatio />
                        <Skeleton width={20} height={16} round={8} disableAspectRatio />
                      </Flexbox>
                    </Grid>
                  ))}
                {!isLoading &&
                  data.map(({ id, name, description }) => {
                    const needImage = filterImageColorNames.includes(description);
                    const colorCode = filterColors[description as keyof typeof filterColors];

                    return (
                      <Grid key={`camel-seller-step-color-${id}`} item xs={5}>
                        <Flexbox
                          direction="vertical"
                          alignment="center"
                          gap={4}
                          customStyle={{
                            height: 60,
                            textAlign: 'center'
                          }}
                        >
                          <Box
                            customStyle={{
                              position: 'relative'
                            }}
                          >
                            {needImage ? (
                              <Image
                                width={40}
                                height={40}
                                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/ico/colors/${description}.png`}
                                alt="Color Img"
                                round="50%"
                                disableAspectRatio
                                onClick={handleClickColor({ id, name, description })}
                              />
                            ) : (
                              <ColorSample
                                colorCode={colorCode}
                                onClick={handleClickColor({ id, name, description })}
                              />
                            )}
                            {colors.some(({ id: colorId }) => colorId === id) && (
                              <Icon
                                name="CheckOutlined"
                                color={
                                  needReverseCheckFilterColorNames.includes(description)
                                    ? 'black'
                                    : 'white'
                                }
                                customStyle={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  pointerEvents: 'none'
                                }}
                              />
                            )}
                          </Box>
                          <Typography variant="body2">{name}</Typography>
                        </Flexbox>
                      </Grid>
                    );
                  })}
              </SurveyGrid>
            </>
          )}
          <Box
            customStyle={{
              marginTop: 32
            }}
          >
            {step === 0 && (
              <>
                <Flexbox
                  gap={2}
                  customStyle={{
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}
                >
                  {stepProgresses.map((stepProgress) => (
                    <Box
                      key={`camel-seller-survey-step-${stepProgress}`}
                      customStyle={{
                        flexGrow: 1,
                        height: 8,
                        backgroundColor: common.bg02
                      }}
                    >
                      <Box
                        customStyle={{
                          width: debouncedCurrentStep > stepProgress ? '100%' : 0,
                          height: '100%',
                          backgroundColor: primary.light,
                          transition: 'width 0.5s'
                        }}
                      />
                    </Box>
                  ))}
                </Flexbox>
                <Typography
                  dangerouslySetInnerHTML={{
                    __html:
                      currentStep === 0
                        ? '4개의 질문에 답하면 내 매물이 <b>메인화면에 노출</b>돼요!'
                        : `<b>메인화면에 노출</b>까지 ${
                            stepProgresses.length - currentStep
                          }개의 질문이 남았어요!`
                  }}
                  customStyle={{
                    textAlign: 'center',
                    margin: '12px 0',
                    '& > b': {
                      fontWeight: 400,
                      color: primary.light
                    }
                  }}
                />
              </>
            )}
            {debouncedCurrentStep === 3 && (
              <SurveyBox
                open={currentStep === 3}
                css={{
                  marginTop: step === 0 ? 20 : undefined
                }}
              >
                <Button
                  variant="solid"
                  brandColor="primary"
                  size="xlarge"
                  fullWidth
                  disabled={colors.length === 0}
                  onClick={handleClickComplete}
                >
                  완료
                </Button>
              </SurveyBox>
            )}
          </Box>
        </Flexbox>
      </BottomSheet>
      <Toast open={openToast} onClose={() => setOpenToast(false)}>
        최대 3개까지만 선택할 수 있어요.
      </Toast>
    </>
  );
}

const SurveyBox = styled.div<{ open: boolean }>`
  opacity: 0;
  animation: ${({ open }) => (open ? 'show' : 'hide')} 0.5s forwards;

  @keyframes show {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  @keyframes hide {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`;

const SurveyGrid = styled(Grid)<{ open: boolean }>`
  flex: 1;
  overflow-y: auto;
  opacity: 0;
  animation: ${({ open }) => (open ? 'show' : 'hide')} 0.5s forwards;

  @keyframes show {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  @keyframes hide {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`;

const ColorSample = styled.div<{ colorCode: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      },
      colorCode
    }) => (colorCode === '#FFFFFF' ? common.line01 : 'transparent')};
  background: ${({ colorCode }) => colorCode};
`;

export default CamelSellerSurveyBottomSheet;
