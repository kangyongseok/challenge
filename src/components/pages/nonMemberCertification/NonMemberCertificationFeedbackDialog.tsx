import { useEffect } from 'react';

import { useRecoilState } from 'recoil';

import { NonMemberAuthFeedbackDialog } from '@components/UI/organisms';

import { nonMemberCertificationFeedbackDialogState } from '@recoil/nonMemberCertification/atom';

function NonMemberCertificationFeedbackDialog() {
  const [{ open, title, description }, setNonMemberCertificationFeedbackDialogState] =
    useRecoilState(nonMemberCertificationFeedbackDialogState);

  useEffect(() => {
    return () => {
      setNonMemberCertificationFeedbackDialogState((prevState) => ({
        ...prevState,
        open: false
      }));
    };
  }, [setNonMemberCertificationFeedbackDialogState]);

  return (
    <NonMemberAuthFeedbackDialog
      open={open}
      onClose={() =>
        setNonMemberCertificationFeedbackDialogState((prevState) => ({
          ...prevState,
          open: false
        }))
      }
      title={title}
      description={description}
    />
  );
}

export default NonMemberCertificationFeedbackDialog;
