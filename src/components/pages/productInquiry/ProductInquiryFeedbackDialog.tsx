import { useEffect } from 'react';

import { useRecoilState } from 'recoil';

import { NonMemberAuthFeedbackDialog } from '@components/UI/organisms';

import { productInquiryFeedbackDialogState } from '@recoil/productInquiry/atom';

function ProductInquiryFeedbackDialog() {
  const [{ open, title, description }, setProductInquiryFeedbackDialogState] = useRecoilState(
    productInquiryFeedbackDialogState
  );

  useEffect(() => {
    return () => {
      setProductInquiryFeedbackDialogState((prevState) => ({
        ...prevState,
        open: false
      }));
    };
  }, [setProductInquiryFeedbackDialogState]);

  return (
    <NonMemberAuthFeedbackDialog
      open={open}
      onClose={() =>
        setProductInquiryFeedbackDialogState((prevState) => ({
          ...prevState,
          open: false
        }))
      }
      title={title}
      description={description}
    />
  );
}

export default ProductInquiryFeedbackDialog;
