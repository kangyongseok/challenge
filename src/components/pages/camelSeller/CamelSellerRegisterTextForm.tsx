import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { Button, Toast } from 'mrcamel-ui';
import styled from '@emotion/styled';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import { CamelSellerHeader } from '@components/pages/camelSeller';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { CAMEL_SELLER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { scrollDisable, scrollEnable } from '@utils/scroll';

import type { CamelSellerLocalStorage, SubmitType } from '@typings/camelSeller';
import {
  camelSellerBooleanStateFamily,
  camelSellerEditState,
  camelSellerSubmitState
} from '@recoil/camelSeller';

const placeholder =
  '구입 연도, 구입가, 하자 유무, 구성품, 원하는 거래방식 등 구매자에게 필요한 정보를 추가로 작성해주세요.';

function CamelSellerRegisterTextForm() {
  const textareaRef = useRef(null);
  const [openTextarea, setOpenTextarea] = useState(false);
  const [addInfoText, setAddInfoText] = useState('');
  const [overTextToast, setOverTextToast] = useState(false);
  const [submitData, setSubmitData] = useRecoilState(camelSellerSubmitState);
  const [camelSeller, setCamelSeller] = useState<CamelSellerLocalStorage>();
  const editMode = useRecoilValue(camelSellerBooleanStateFamily('edit'));
  const [editData, setEditData] = useRecoilState(camelSellerEditState);

  useEffect(() => {
    setCamelSeller(editData || (LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage));
    if (textareaRef.current) {
      const textArea = textareaRef.current as HTMLTextAreaElement;
      textArea.style.height = `${textArea.scrollHeight}px`;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (submitData?.description) {
      setAddInfoText(submitData?.description);
      if (textareaRef.current) {
        const textArea = textareaRef.current as HTMLTextAreaElement;
        textArea.style.height = `${textArea.scrollHeight}px`;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitData?.description, addInfoText]);

  useEffect(() => {
    if (openTextarea) {
      logEvent(attrKeys.camelSeller.VIEW_PRODUCT_DESCRIPTION, {
        name: attrProperty.name.PRODUCT_MAIN
      });
    }
  }, [openTextarea]);

  const callForm = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_DESCRIPTION, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.TEMPLATE
    });

    setAddInfoText(`∙ 구입연도 및 장소:
∙ 구입가격:
∙ 하자/오염 여부:
∙ 구성품:
∙ 거래방식:
∙ 보충설명:
    `);
  };

  const handleChangeAddInfo = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setAddInfoText(e.target.value);
  };

  const handleOpenTextarea = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_EDIT, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.DESCRIPTION
    });

    setOpenTextarea(true);
    window.scrollTo(0, 0);
    scrollDisable();
  };

  const handleClick = () => {
    if (addInfoText.length > 2000) {
      setOverTextToast(true);
      return;
    }
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_DESCRIPTION, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.DONE
    });

    setSubmitData({
      ...(submitData as SubmitType),
      description: addInfoText
    });
    if (editMode.isState) {
      setEditData({
        ...(editData as CamelSellerLocalStorage),
        description: addInfoText
      });
    } else {
      LocalStorage.set(CAMEL_SELLER, {
        ...camelSeller,
        description: addInfoText
      });
    }

    setOpenTextarea(false);
    scrollEnable();
  };

  if (openTextarea) {
    return (
      <GeneralTemplate
        header={
          <CamelSellerHeader
            type="textarea"
            callForm={callForm}
            onClickClose={() => {
              setOpenTextarea(false);
              scrollEnable();
            }}
          />
        }
      >
        <LayerStyle>
          <TextareaIsertInfo
            placeholder={placeholder}
            // maxLength={2000}
            value={addInfoText}
            onChange={handleChangeAddInfo}
            autoFocus
          />
          <SubmitCtaButton fullWidth brandColor="primary" variant="contained" onClick={handleClick}>
            완료
          </SubmitCtaButton>
        </LayerStyle>
        <Toast
          open={overTextToast}
          onClose={() => setOverTextToast(false)}
          customStyle={{ zIndex: 1000 }}
        >
          글자 수는 2,000자를 넘을 수 없어요.
        </Toast>
      </GeneralTemplate>
    );
  }

  return (
    <TextareaAddInfo
      ref={textareaRef}
      placeholder={placeholder}
      onClick={handleOpenTextarea}
      defaultValue={
        !submitData?.description || submitData?.description === 'null'
          ? ''
          : submitData?.description
      }
    />
  );
}

const TextareaAddInfo = styled.textarea`
  width: 100%;
  outline: none;
  border: none;
  resize: none;
  font-size: ${({ theme }) => theme.typography.h4.size};
  letter-spacing: -0.2px;
  background: white;
`;

const LayerStyle = styled.div`
  background: white;
  position: fixed;
  top: 56px;
  left: 0;
  width: 100%;
  height: calc(100vh - 56px);
  z-index: 100;
  padding: 20px 20px 0 20px;
  overflow: auto;
`;

const TextareaIsertInfo = styled.textarea`
  width: 100%;
  height: calc(100vh - 76px);
  outline: none;
  border: none;
  resize: none;
  font-size: ${({ theme }) => theme.typography.h4.size};
  letter-spacing: -0.2px;
  background: white;
  margin-bottom: 60px;
`;

const SubmitCtaButton = styled(Button)`
  position: fixed;
  bottom: 0;
  left: 0;
  border-radius: 0;
  height: 52px;
`;

export default CamelSellerRegisterTextForm;
