import { useEffect, useState } from 'react';

import { AppUpdateForSafePayment } from '@components/UI/organisms';

import { needUpdateSafePaymentIOSVersion } from '@utils/common';

function ProductOrderAppUpdateDialog() {
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    if (needUpdateSafePaymentIOSVersion()) {
      setOpen(true);
    }
  }, [focus]);

  useEffect(() => {
    const handleFocus = () => {
      setFocus((prevState) => !prevState);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  return <AppUpdateForSafePayment open={open} />;
}

export default ProductOrderAppUpdateDialog;
