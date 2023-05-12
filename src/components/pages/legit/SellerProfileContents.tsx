import { ChangeEvent, useEffect, useRef, useState } from 'react';

import { useRecoilState } from 'recoil';
import TextareaAutosize from 'react-textarea-autosize';
import Toast from '@mrcamelhub/camel-ui-toast';
import { Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { extractTagRegx } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { shake } from '@styles/transition';

import { legitProfileEditState } from '@recoil/legitProfile';

function SellerProfileContents() {
  const {
    theme: {
      palette: { common, secondary }
    }
  } = useTheme();

  const [isBanWord, setIsBanWord] = useState(false);
  const [open, setOpen] = useState(false);

  const [sellerEditInfo, setSellerEditInfo] = useRecoilState(legitProfileEditState);

  const shopDescriptionRef = useRef<null | HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsBanWord(extractTagRegx.test(sellerEditInfo.shopDescription || ''));
  }, [sellerEditInfo.shopDescription]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > 100) {
      setOpen(true);
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
    <>
      <Wrap>
        <Typography weight="bold" customStyle={{ color: common.ui80 }}>
          내 상점 소개
        </Typography>
        <TextAreaWrap ban={isBanWord}>
          <AutoTextArea
            ref={shopDescriptionRef}
            onClick={() =>
              logEvent(attrKeys.legitProfile.CLICK_STORE_EDIT, {
                att: 'LEGIT_SELLER'
              })
            }
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

export default SellerProfileContents;
