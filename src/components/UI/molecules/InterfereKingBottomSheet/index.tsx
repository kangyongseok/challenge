import { ChangeEvent, useCallback, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import TextareaAutosize from 'react-textarea-autosize';
import Toast from '@mrcamelhub/camel-ui-toast';
import { BottomSheet, Box, Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { exitNextStepBottomSheetState } from '@recoil/common';

import {
  CloseIcon,
  Description,
  DescriptionInfo,
  EvaluationTooltip,
  IconBox,
  NextButton
} from './InterfereKingBottomSheet.style';

export type Selected = 0 | 1 | 2 | null;
export type EvaluationData = {
  evalType: Selected;
  icon: string;
  toolTipText: string;
  defaultTooltip?: string;
};

type InterFereLingBottomSheetProps = {
  titles: string[];
  isOpen: boolean;
  selectedType: Selected;
  description: string;
  evaluationData: EvaluationData[];
  setIsOpen: (params: boolean) => void;
  onSelect: (params: Selected) => void;
  onChange: (params: string) => void;
  onNext: () => void;
};

function InterfereKingBottomSheet({
  titles,
  isOpen,
  selectedType,
  description,
  evaluationData,
  setIsOpen,
  onSelect,
  onChange,
  onNext
}: InterFereLingBottomSheetProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [open, setOpen] = useState(false);

  const setNextBottomSheet = useSetRecoilState(exitNextStepBottomSheetState);

  const handleChangeDescription = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      if (e.target.value.length > 300) {
        setOpen(true);
      } else {
        onChange(e.target.value);
      }
    },
    [onChange]
  );

  const handleClickNext = () => {
    setIsOpen(false);
    onNext();
    setTimeout(() => {
      setNextBottomSheet(true);
    }, 500);
  };

  return (
    <>
      <BottomSheet
        disableSwipeable
        open={isOpen}
        onClose={() => setIsOpen(false)}
        customStyle={{ textAlign: 'center', padding: '32px 30px' }}
      >
        <CloseIcon onClick={() => setIsOpen(false)}>
          <Icon name="CloseOutlined" />
        </CloseIcon>
        <Box customStyle={{ marginBottom: 8 }}>
          {titles.map((title) => (
            <Typography variant="h2" weight="bold" key={`title-${title}`}>
              {title}
            </Typography>
          ))}
        </Box>
        <Typography color="ui60">10초만 시간내주시고 평가해주세요!</Typography>
        <Typography color="ui60">카멜은 유저님의 의견이 너무 궁금합니다</Typography>
        <Flexbox
          alignment="center"
          justifyContent="center"
          gap={12}
          customStyle={{ marginTop: 20 }}
        >
          {evaluationData.map((evaluation) => (
            <EvaluationTooltip
              isAnimation={!!(evaluation.defaultTooltip && typeof selectedType !== 'number')}
              open={
                selectedType === evaluation.evalType ||
                (!!evaluation.defaultTooltip && typeof selectedType !== 'number')
              }
              placement="bottom"
              message={
                typeof selectedType !== 'number' ? (
                  <Typography color="uiWhite">{evaluation.defaultTooltip}</Typography>
                ) : (
                  <Typography color="uiWhite">{evaluation.toolTipText}</Typography>
                )
              }
              key={`evaluation-type-${evaluation.evalType}`}
              customStyle={{ bottom: 20 }}
            >
              <IconBox
                onClick={() => onSelect(evaluation.evalType)}
                selected={selectedType === evaluation.evalType}
              >
                {evaluation.icon}
              </IconBox>
            </EvaluationTooltip>
          ))}
        </Flexbox>
        {typeof selectedType === 'number' && (
          <>
            <Box
              customStyle={{
                width: '100%',
                height: 1,
                background: common.line02,
                margin: '20px 0'
              }}
            />
            <Typography variant="h4">왜 그렇게 생각하시는지 알려주시겠어요?</Typography>
            <Description>
              <TextareaAutosize
                placeholder="의견 간단하게 남겨주세요"
                value={description}
                onChange={handleChangeDescription}
                style={{ border: 'none' }}
              />
              <DescriptionInfo variant="small2" weight="medium">
                {description?.length || 0}
                <span>/ 300자</span>
              </DescriptionInfo>
            </Description>
          </>
        )}
        <NextButton
          fullWidth
          size="xlarge"
          selected={typeof selectedType === 'number'}
          disabled={typeof selectedType !== 'number'}
          onClick={handleClickNext}
        >
          NEXT
        </NextButton>
      </BottomSheet>
      <Toast open={open} onClose={() => setOpen(false)}>
        300글자만 입력할 수 있어요.
      </Toast>
    </>
  );
}

export default InterfereKingBottomSheet;
