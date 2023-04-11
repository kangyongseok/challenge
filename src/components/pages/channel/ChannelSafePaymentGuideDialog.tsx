import { useRecoilState } from 'recoil';

import { SafePaymentGuideDialog } from '@components/UI/organisms';

import { channelDialogStateFamily } from '@recoil/channel';

function ChannelSafePaymentGuideDialog() {
  const [{ open }, setOpenState] = useRecoilState(channelDialogStateFamily('safePaymentGuide'));

  return (
    <SafePaymentGuideDialog
      open={open}
      onClose={() => setOpenState((prevState) => ({ ...prevState, open: false }))}
    />
  );
}

export default ChannelSafePaymentGuideDialog;
