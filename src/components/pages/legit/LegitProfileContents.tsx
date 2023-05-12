import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState } from 'recoil';
import TextareaAutosize from 'react-textarea-autosize';
import { useQuery } from '@tanstack/react-query';
import Toast from '@mrcamelhub/camel-ui-toast';
import { Box, Chip, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchLegitsBrands } from '@api/model';

import queryKeys from '@constants/queryKeys';
import { extractTagRegx } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { shake } from '@styles/transition';

import { legitProfileEditState } from '@recoil/legitProfile';

function LegitProfileContents() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const descriptionRef = useRef<null | HTMLTextAreaElement>(null);
  const { data: legitsBrands = [] } = useQuery(queryKeys.models.legitsBrands(), () =>
    fetchLegitsBrands()
  );
  const [sellerEditInfo, setSellerEditInfo] = useRecoilState(legitProfileEditState);
  const [isBanWord, setIsBanWord] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setIsBanWord(extractTagRegx.test(sellerEditInfo.legitTitle || ''));
  }, [sellerEditInfo.legitTitle]);

  const handleClickInput = () => {
    descriptionRef.current?.focus();
    setSellerEditInfo({
      ...sellerEditInfo,
      legitTitle: (sellerEditInfo.legitTitle || '').replace(extractTagRegx, '')
    });
    setIsBanWord(false);
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > 100) {
      setOpen(true);
      return;
    }
    setSellerEditInfo({ ...sellerEditInfo, legitTitle: e.target.value.substring(0, 100) });
  };

  const handleClickChip = (chipId: number) => {
    const prevData = sellerEditInfo.legitTargetBrandIds as number[];
    if (prevData?.includes(chipId)) {
      setSellerEditInfo({
        ...sellerEditInfo,
        legitTargetBrandIds: prevData?.filter((id) => id !== chipId)
      });
    } else if (prevData.length < 15) {
      setSellerEditInfo({
        ...sellerEditInfo,
        legitTargetBrandIds: [...prevData, chipId]
      });
    }
  };

  return (
    <>
      <Wrap>
        <Typography weight="bold" color="ui80">
          감정사 한 줄 소개
        </Typography>
        <TextAreaWrap ban={isBanWord}>
          <AutoTextArea
            ref={descriptionRef}
            onClick={() =>
              logEvent(attrKeys.legitProfile.CLICK_LEGIT_PROFILE_EDIT, {
                att: 'LEGIT_SELLER'
              })
            }
            onChange={handleChange}
            value={(sellerEditInfo.legitTitle || '').replace(extractTagRegx, '')}
            ban={isBanWord}
            placeholder={'한 줄 소개를 입력해주세요\n(명품 관련 주요 업무 경력, 감정 경력 등)'}
          />
          <BanWordText
            variant="h4"
            dangerouslySetInnerHTML={{ __html: sellerEditInfo.legitTitle || '' }}
            onClick={handleClickInput}
          />
          <Flexbox
            justifyContent="space-between"
            alignment="center"
            customStyle={{ marginTop: 'auto' }}
          >
            <Typography variant="small2" weight="medium" color="ui80">
              <span style={{ color: common.ui60 }}>
                {(sellerEditInfo.legitTitle || '').replace(extractTagRegx, '').length}
              </span>{' '}
              / 100자
            </Typography>
            {isBanWord && (
              <Typography variant="small2" weight="medium" color="red-light">
                욕설 및 비속어는 사용할 수 없어요!
              </Typography>
            )}
          </Flexbox>
        </TextAreaWrap>
        <Box customStyle={{ marginTop: 32 }}>
          <Typography weight="bold" customStyle={{ color: common.ui80, marginBottom: 12 }}>
            감정가능 브랜드 (최대 15개 선택)
          </Typography>
          <Flexbox gap={8} customStyle={{ flexWrap: 'wrap' }}>
            {legitsBrands.map(({ id, name: brandName }) => (
              <Chip
                key={`target-brand-${id}`}
                size="large"
                variant={sellerEditInfo.legitTargetBrandIds?.includes(id) ? 'solid' : 'outline'}
                brandColor="black"
                customStyle={{
                  whiteSpace: 'nowrap',
                  border: sellerEditInfo.legitTargetBrandIds?.includes(id)
                    ? `1px solid ${common.ui20}`
                    : `1px solid ${common.line01}`
                }}
                onClick={() => handleClickChip(id)}
              >
                #{brandName}
              </Chip>
            ))}
          </Flexbox>
        </Box>
      </Wrap>
      <Toast open={open} onClose={() => setOpen(false)}>
        100글자만 입력할 수 있어요.
      </Toast>
    </>
  );
}

const Wrap = styled.div`
  padding: 32px 20px 56px;
`;

const BanWordText = styled(Typography)`
  b {
    font-weight: ${({ theme: { typography } }) => typography.h4.weight.medium};
    color: ${({
      theme: {
        palette: { secondary }
      }
    }) => secondary.red.light};
  }
  position: absolute;
  top: 12px;
  left: 12px;
  width: calc(100% - 24px);
  min-height: 150px;
`;

const TextAreaWrap = styled.div<{ ban?: boolean }>`
  width: 100%;
  height: 296px;
  margin-top: 12px;
  padding: 12px;
  position: relative;
  border: 1px solid
    ${({
      theme: {
        palette: { common, secondary }
      },
      ban
    }) => (ban ? secondary.red.light : common.line01)};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  font-weight: ${({ theme: { typography } }) => typography.h4.weight.regular};
  font-size: ${({ theme: { typography } }) => typography.h4.size};
  ${({ ban, theme: { palette } }): CSSObject => {
    if (ban) {
      return {
        outline: 0,
        borderColor: palette.secondary.red.light,
        animationName: shake,
        animationDuration: '0.5s',
        animationDelay: '0.25s'
      };
    }
    return {};
  }}
`;

const AutoTextArea = styled(TextareaAutosize)<{ ban: boolean }>`
  width: 100%;
  min-height: 230px;
  font-size: ${({ theme: { typography } }) => typography.h4};
  line-height: 20px;
  resize: none;
  margin-bottom: 10px;
  outline: none;
  color: ${({ ban }) => (ban ? 'transparent' : undefined)};
  background: ${({ ban }) => (ban ? 'transparent' : undefined)};
  position: relative;
  z-index: ${({ ban }) => (ban ? 0 : 1)};
`;

export default LegitProfileContents;
