import { useEffect, useRef } from 'react';

import { Typography } from '@mrcamelhub/camel-ui';

import FlexibleTemplate from '@components/templates/FlexibleTemplate';
import {
  NonMemberCertificationFeedbackDialog,
  NonMemberCertificationFooter,
  NonMemberCertificationForm,
  NonMemberCertificationHeader
} from '@components/pages/nonMemberCertification';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function NonMemberCertification() {
  const authNumberInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    logEvent(attrKeys.mypage.VIEW_CHECK_NUMBER, {
      title: attrProperty.title.ORDER
    });
  }, []);

  return (
    <>
      <FlexibleTemplate
        header={<NonMemberCertificationHeader />}
        footer={<NonMemberCertificationFooter authNumberInputRef={authNumberInputRef} />}
      >
        <Typography
          variant="h2"
          weight="bold"
          customStyle={{
            marginTop: 20
          }}
        >
          비회원 주문조회
        </Typography>
        <Typography
          color="ui60"
          customStyle={{
            marginTop: 4
          }}
        >
          주문확인을 위해 휴대전화번호를 인증해주세요.
        </Typography>
        <NonMemberCertificationForm authNumberInputRef={authNumberInputRef} />
      </FlexibleTemplate>
      <NonMemberCertificationFeedbackDialog />
    </>
  );
}

export default NonMemberCertification;
