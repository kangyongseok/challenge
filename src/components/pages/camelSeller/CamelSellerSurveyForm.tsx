import { useEffect, useRef, useState } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Button, Chip, Flexbox, Icon, Image, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { filterColors, filterImageColorNames } from '@constants/productsFilter';
import { HEADER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  camelSellerIsMovedScrollState,
  camelSellerSurveyBottomSheetState,
  camelSellerSurveyFormOffsetTopState,
  camelSellerSurveyState,
  camelSellerSurveyValidatorState
} from '@recoil/camelSeller';

function CamelSellerSurveyForm() {
  const { query } = useRouter();
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();

  const [{ units, stores, distances, colors }, setCamelSellerSurveyState] =
    useRecoilState(camelSellerSurveyState);
  const [{ open: openSurveyBottomSheet }, setOpenSurveyBottomSheet] = useRecoilState(
    camelSellerSurveyBottomSheetState
  );
  const [isMovedScroll, setIsMovedScroll] = useRecoilState(camelSellerIsMovedScrollState);
  const isValid = useRecoilValue(camelSellerSurveyValidatorState);
  const setSurveyFormOffsetTopState = useSetRecoilState(camelSellerSurveyFormOffsetTopState);
  const setSurveyBottomSheetState = useSetRecoilState(camelSellerSurveyBottomSheetState);

  const [open, setOpen] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const formScrollTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleClick = () => {
    setOpen(true);
    setOpenSurveyBottomSheet({
      step: 0,
      open: true
    });
  };

  const handleClickChip =
    ({
      type,
      newId,
      title,
      name
    }: {
      type: 'units' | 'stores' | 'distances' | 'colors';
      newId: number;
      title: string;
      name: string;
    }) =>
    () => {
      logEvent(attrKeys.camelSeller.SELECT_ITEM, {
        name: attrProperty.name.PRODUCT_MAIN,
        title,
        att: name
      });

      if (type === 'colors') {
        setCamelSellerSurveyState((prevState) => ({
          ...prevState,
          colors: colors.filter(({ id }) => id !== newId)
        }));
      } else {
        setCamelSellerSurveyState((prevState) => ({
          ...prevState,
          [type]: prevState[type].map((prevData) => ({
            ...prevData,
            selected: prevData.id === newId
          }))
        }));
      }
    };

  useEffect(() => setOpen(isValid), [isValid]);

  useEffect(() => {
    if (open) return;

    const hasSelectedUnits = !!units.filter(({ selected }) => selected).length;
    const hasSelectedStore = !!stores.filter(({ selected }) => selected).length;
    const hasSelectedDistance = !!distances.filter(({ selected }) => selected).length;

    setOpen(
      isValid || hasSelectedUnits || hasSelectedStore || hasSelectedDistance || !!colors.length
    );
  }, [setOpen, open, isValid, units, stores, distances, colors]);

  useEffect(() => {
    if (openSurveyBottomSheet && formRef.current) {
      setSurveyFormOffsetTopState(formRef.current.offsetTop - HEADER_HEIGHT - 32); // -marginTop
    }
  }, [setSurveyFormOffsetTopState, openSurveyBottomSheet]);

  useEffect(() => {
    if (query.id && query.anchor === 'surveyForm' && open && !isMovedScroll && formRef.current) {
      formScrollTimerRef.current = setTimeout(() => {
        if (!formRef.current) return;

        setIsMovedScroll(true);

        const { offsetTop } = formRef.current;
        window.scrollTo({
          top: offsetTop - HEADER_HEIGHT - 32, // -marginTop
          behavior: 'smooth'
        });
      }, 500);
    }
  }, [query.id, query.anchor, open, setIsMovedScroll, isMovedScroll]);

  return (
    <Box
      ref={formRef}
      customStyle={{
        marginTop: 32,
        padding: 20,
        borderRadius: 8,
        backgroundColor: common.bg02
      }}
    >
      <Flexbox alignment="center" customStyle={{ maxHeight: 52, fontSize: 52 }}>
        🙋‍♀️
      </Flexbox>
      <Typography
        variant="h3"
        weight="bold"
        customStyle={{
          marginTop: 20,
          '& > b': {
            color: primary.main
          }
        }}
      >
        구매자가 가장 많이 하는 질문에 답하고
        <br />내 매물 <b>메인노출</b>하세요!
      </Typography>
      <Typography color="ui60" customStyle={{ marginTop: 4 }}>
        5초 답변완료하고, 빠른 판매혜택 받으세요
      </Typography>
      {!open && (
        <Button
          variant="outline"
          brandColor="gray"
          size="large"
          onClick={handleClick}
          customStyle={{
            marginTop: 20,
            borderColor: 'transparent'
          }}
        >
          내 매물 메인에 노출하기
        </Button>
      )}
      {open && (
        <Flexbox
          direction="vertical"
          gap={32}
          customStyle={{
            marginTop: 32
          }}
        >
          <Flexbox direction="vertical" gap={8}>
            <Typography weight="medium">구성품이 있나요?</Typography>
            <List>
              {units.map(({ id, name, selected }) => (
                <Chip
                  key={`camel-seller-unit-${name}-${id}`}
                  variant="solid"
                  brandColor={selected ? 'black' : 'white'}
                  size="large"
                  isRound={false}
                  onClick={handleClickChip({ type: 'units', newId: id, title: 'UNIT', name })}
                >
                  {name}
                </Chip>
              ))}
            </List>
          </Flexbox>
          <Flexbox direction="vertical" gap={8}>
            <Typography weight="medium">어디서 구입하셨나요?</Typography>
            <List>
              {stores.map(({ id, name, selected }) => (
                <Chip
                  key={`camel-seller-store-${name}-${id}`}
                  variant="solid"
                  brandColor={selected ? 'black' : 'white'}
                  size="large"
                  isRound={false}
                  onClick={handleClickChip({ type: 'stores', newId: id, title: 'STORE', name })}
                >
                  {name}
                </Chip>
              ))}
            </List>
          </Flexbox>
          <Flexbox direction="vertical" gap={8}>
            <Typography weight="medium">직거래 되나요? 택배거래 되나요?</Typography>
            <List>
              {distances.map(({ id, name, selected }) => (
                <Chip
                  key={`camel-seller-distance-${name}-${id}`}
                  variant="solid"
                  brandColor={selected ? 'black' : 'white'}
                  size="large"
                  isRound={false}
                  onClick={handleClickChip({
                    type: 'distances',
                    newId: id,
                    title: 'DISTANCE',
                    name
                  })}
                >
                  {name}
                </Chip>
              ))}
            </List>
          </Flexbox>
          <Flexbox direction="vertical" gap={8}>
            <Typography weight="medium">색상을 알려주세요.</Typography>
            {colors.length > 0 ? (
              <List>
                {colors.map(({ id, name, description }) => {
                  const needImage = filterImageColorNames.includes(description);
                  const colorCode = filterColors[description as keyof typeof filterColors];

                  return (
                    <Chip
                      key={`camel-seller-store-${name}-${id}`}
                      variant="solid"
                      brandColor="black"
                      size="large"
                      isRound={false}
                      startIcon={
                        needImage ? (
                          <Image
                            width={20}
                            height={20}
                            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/ico/colors/${description}.png`}
                            alt="Color Img"
                            round="50%"
                            disableAspectRatio
                          />
                        ) : (
                          <ColorSample colorCode={colorCode} />
                        )
                      }
                      endIcon={<Icon name="CloseOutlined" color={common.ui60} />}
                      onClick={handleClickChip({ type: 'colors', newId: id, title: 'COLOR', name })}
                    >
                      {name}
                    </Chip>
                  );
                })}
              </List>
            ) : (
              <Chip
                fullWidth
                variant="solid"
                brandColor="white"
                size="large"
                isRound={false}
                onClick={() =>
                  setSurveyBottomSheetState({
                    step: 3,
                    open: true
                  })
                }
              >
                색상 선택
              </Chip>
            )}
            {colors.length > 0 && (
              <Chip
                variant="solid"
                brandColor="white"
                size="large"
                isRound={false}
                onClick={() =>
                  setSurveyBottomSheetState({
                    step: 3,
                    open: true
                  })
                }
                customStyle={{
                  marginTop: 4
                }}
              >
                색상 다시선택
              </Chip>
            )}
          </Flexbox>
        </Flexbox>
      )}
      <Box
        customStyle={{ width: '100%', height: 1, margin: '20px 0', backgroundColor: common.line01 }}
      />
      <Typography variant="body2" color="ui60">
        빠른 판매를 위해 메인화면 고정노출, 매일 자동 끌올과 함께 비슷한 매물을 찾는 구매자에게
        알림을 보내 드립니다.
      </Typography>
    </Box>
  );
}

const List = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  column-gap: 8px;
  margin: 0 -20px;
  padding: 0 20px;
  overflow-x: auto;
`;

const ColorSample = styled.div<{ colorCode: string }>`
  width: 20px;
  height: 20px;
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

export default CamelSellerSurveyForm;
