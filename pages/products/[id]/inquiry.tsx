import { useEffect, useRef } from 'react';

import { Typography } from '@mrcamelhub/camel-ui';

import FlexibleTemplate from '@components/templates/FlexibleTemplate';
import {
  ProductInquiryFeedbackDialog,
  ProductInquiryFooter,
  ProductInquiryForm,
  ProductInquiryHeader
} from '@components/pages/productInquiry';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function ProductDetailInquiry() {
  const authNumberInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    logEvent(attrKeys.mypage.VIEW_NOLOGIN, {
      title: attrProperty.title.CHANNEL
    });
  }, []);

  return (
    <>
      <FlexibleTemplate
        header={<ProductInquiryHeader />}
        footer={<ProductInquiryFooter authNumberInputRef={authNumberInputRef} />}
      >
        <Typography
          variant="h2"
          weight="bold"
          customStyle={{
            marginTop: 20
          }}
        >
          문의하기
        </Typography>
        <Typography
          color="ui60"
          customStyle={{
            marginTop: 4
          }}
        >
          판매자에게 궁금한 점을 물어보세요.
          <br />
          답변이 오면 카카오 알림톡을 보내드릴게요.
        </Typography>
        <ProductInquiryForm authNumberInputRef={authNumberInputRef} />
      </FlexibleTemplate>
      <ProductInquiryFeedbackDialog />
    </>
  );
}

export default ProductDetailInquiry;
