import type { ChangeEvent } from 'react';

import TextareaAutosize from 'react-textarea-autosize';
import { Chip, Flexbox, Typography, dark } from 'mrcamel-ui';
import styled from '@emotion/styled';

import type { PostProductLegitData } from '@dto/productLegit';

import { additionalInfos } from '@constants/productlegits';

interface LegitSelectAdditionalInfoProps {
  additionalIds: number[];
  description?: string;
  onclickAdditionalInfo: (
    id: keyof PostProductLegitData['additionalIds'],
    label: string
  ) => () => void;
  onChangeDescription: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}

function LegitSelectAdditionalInfo({
  additionalIds,
  description,
  onclickAdditionalInfo,
  onChangeDescription
}: LegitSelectAdditionalInfoProps) {
  return (
    <Flexbox direction="vertical" gap={20} customStyle={{ userSelect: 'none' }}>
      <Typography variant="h3" weight="medium">
        추가 정보를 선택해주세요!
      </Typography>
      <Flexbox gap={8} customStyle={{ flexWrap: 'wrap' }}>
        {additionalInfos.map(({ id, label }) => (
          <Chip
            key={`additional-info-${id}`}
            size="large"
            weight="regular"
            brandColor="black"
            isRound={false}
            variant={
              additionalIds.includes(id as keyof PostProductLegitData['additionalIds'])
                ? 'contained'
                : 'outlined'
            }
            customStyle={{
              backgroundColor: additionalIds.includes(
                id as keyof PostProductLegitData['additionalIds']
              )
                ? dark.palette.common.uiBlack
                : dark.palette.common.ui90
            }}
            onClick={onclickAdditionalInfo(
              id as keyof PostProductLegitData['additionalIds'],
              label
            )}
          >
            {label}
          </Chip>
        ))}
      </Flexbox>
      <Description>
        <TextareaAutosize
          placeholder="감정사에게 더 전달할 정보가 있다면 적어주세요."
          value={description}
          onChange={onChangeDescription}
        />
        <DescriptionInfo variant="small2" weight="medium">
          {`${description?.length || 0}/ 300자`}
        </DescriptionInfo>
      </Description>
    </Flexbox>
  );
}

const Description = styled.div`
  position: relative;

  textarea {
    min-height: 168px;
    width: 100%;
    background-color: ${dark.palette.common.bg01};
    border: 1px solid ${dark.palette.common.line01};
    border-radius: 8px;
    padding: 12px 12px 24px;
    color: ${dark.palette.common.ui20};
    resize: none;

    ${({ theme: { typography } }) => ({
      fontSize: typography.h4.size,
      fontWeight: typography.h4.weight.regular,
      lineHeight: typography.h4.lineHeight,
      letterSpacing: typography.h4.letterSpacing
    })};

    ::placeholder {
      color: ${dark.palette.common.ui80};
      white-space: pre-wrap;

      ${({ theme: { typography } }) => ({
        fontSize: typography.h4.size,
        fontWeight: typography.h4.weight.regular,
        lineHeight: typography.h4.lineHeight,
        letterSpacing: typography.h4.letterSpacing
      })};
    }
  }
`;

const DescriptionInfo = styled(Typography)`
  display: inline-flex;
  bottom: 6px;
  position: absolute;
  left: 0;
  padding: 0 0 12px 12px;
  color: ${dark.palette.common.ui60};
`;

export default LegitSelectAdditionalInfo;
