import { useState } from 'react';

import { useRecoilState } from 'recoil';
import TextareaAutosize from 'react-textarea-autosize';
import { Flexbox, Typography } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { camelSellerTempSaveDataState } from '@recoil/camelSeller';

function CamelSellerDescription() {
  const [{ description }, setTempData] = useRecoilState(camelSellerTempSaveDataState);

  const [isFocus, setIsFocus] = useState(false);

  return (
    <Flexbox gap={8} direction="vertical" customStyle={{ marginTop: 32 }}>
      <Typography weight="medium">설명 (선택)</Typography>
      <TextAreaWrap>
        <TextArea
          maxLength={2000}
          onChange={(e) =>
            setTempData((prevState) => ({
              ...prevState,
              description: e.currentTarget.value
            }))
          }
          value={description}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onClick={() =>
            logEvent(attrKeys.camelSeller.CLICK_PRODUCT_EDIT, {
              name: attrProperty.name.PRODUCT_MAIN,
              title: attrProperty.title.DESCRIPTION,
              att: description
            })
          }
          placeholder={
            !isFocus && !description
              ? '구매자가 믿고 살 수 있도록, 더 상세하게 전달하고 싶은 내용을 입력해주세요.\n(세부 구성품, 자세한 상태, 판매 이유 등)\n\n자세하고 명확한 정보는 구매욕구를 높입니다.'
              : ''
          }
        />
      </TextAreaWrap>
    </Flexbox>
  );
}

const TextAreaWrap = styled.div`
  position: relative;
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
  border-radius: 8px;
  min-height: 144px;
  max-height: 144px;
  padding: 12px;
`;

const TextArea = styled(TextareaAutosize)`
  width: 100%;
  min-height: 120px;
  max-height: 120px;
  outline: 0;
  border-radius: 8px;
  overflow: hidden;
  resize: none;
  ${({
    theme: {
      typography: { h4 }
    }
  }): CSSObject => ({
    fontSize: h4.size,
    fontWeight: h4.weight.regular,
    lineHeight: h4.lineHeight,
    letterSpacing: h4.letterSpacing
  })}

  &::placeholder {
    ${({
      theme: {
        typography: { h4 },
        palette: { common }
      }
    }): CSSObject => ({
      fontSize: h4.size,
      fontWeight: h4.weight.regular,
      lineHeight: h4.lineHeight,
      letterSpacing: h4.letterSpacing,
      color: common.ui80
    })}
  }
`;

export default CamelSellerDescription;
