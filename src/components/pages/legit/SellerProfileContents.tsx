import { ChangeEvent, useEffect, useRef, useState } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import TextareaAutosize from 'react-textarea-autosize';
import { Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { CAMEL_SUBSET_FONTFAMILY, extractTagRegx } from '@constants/common';

import { shake } from '@styles/transition';

import { legitProfileEditState } from '@recoil/legitProfile';
import { toastState } from '@recoil/common';

function SellerProfileContents() {
  const {
    theme: {
      palette: { common, secondary }
    }
  } = useTheme();

  const shopDescriptionRef = useRef<null | HTMLTextAreaElement>(null);
  const [isBanWord, setIsBanWord] = useState(false);
  const [sellerEditInfo, setSellerEditInfo] = useRecoilState(legitProfileEditState);
  const setToastState = useSetRecoilState(toastState);

  useEffect(() => {
    setIsBanWord(extractTagRegx.test(sellerEditInfo.shopDescription || ''));
  }, [sellerEditInfo.shopDescription]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > 100) {
      setToastState({
        type: 'common',
        status: 'overLimitText',
        params: { length: 100 }
      });
      return;
    }
    setSellerEditInfo({ ...sellerEditInfo, shopDescription: e.target.value.substring(0, 100) });
  };

  const handleClickInput = () => {
    shopDescriptionRef.current?.focus();
    setSellerEditInfo({
      ...sellerEditInfo,
      shopDescription: (sellerEditInfo.shopDescription || '').replace(extractTagRegx, '')
    });
    setIsBanWord(false);
  };

  return (
    <Wrap>
      <Typography weight="bold" customStyle={{ color: common.ui80 }}>
        내 상점 소개
      </Typography>
      <TextAreaWrap ban={isBanWord}>
        <AutoTextArea
          ref={shopDescriptionRef}
          onChange={handleChange}
          value={(sellerEditInfo.shopDescription || '').replace(extractTagRegx, '')}
          ban={isBanWord}
        />
        <BanWordText
          variant="h4"
          dangerouslySetInnerHTML={{ __html: sellerEditInfo.shopDescription || '' }}
          onClick={handleClickInput}
        />
        <Flexbox
          justifyContent="space-between"
          alignment="center"
          customStyle={{ marginTop: 'auto' }}
        >
          <Typography variant="small2" weight="medium" customStyle={{ color: common.ui80 }}>
            <span style={{ color: common.ui60 }}>
              {(sellerEditInfo.shopDescription || '').replace(extractTagRegx, '').length}
            </span>{' '}
            / 100자
          </Typography>
          {isBanWord && (
            <Typography
              variant="small2"
              weight="medium"
              customStyle={{ color: secondary.red.light }}
            >
              욕설 및 비속어는 사용할 수 없어요!
            </Typography>
          )}
        </Flexbox>
      </TextAreaWrap>
    </Wrap>
  );
}

const Wrap = styled.div`
  padding: 32px 20px 56px;
`;

const BanWordText = styled(Typography)`
  font-family: ${CAMEL_SUBSET_FONTFAMILY};
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
  font-family: ${CAMEL_SUBSET_FONTFAMILY};
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

export default SellerProfileContents;
