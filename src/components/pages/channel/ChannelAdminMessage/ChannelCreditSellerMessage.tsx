import type { AdminMessage } from '@sendbird/chat/message';
import { Typography, useTheme } from '@mrcamelhub/camel-ui';

interface ChannelCreditSellerMessageProps {
  message: AdminMessage;
}

function ChannelCreditSellerMessage({ message: { message } }: ChannelCreditSellerMessageProps) {
  const {
    theme: {
      palette: { primary }
    }
  } = useTheme();

  return (
    <Typography
      variant="body2"
      weight="medium"
      dangerouslySetInnerHTML={{
        __html: message
      }}
      customStyle={{
        padding: 12,
        margin: '20px 0',
        textAlign: 'center',
        backgroundColor: primary.bgLight,
        borderRadius: 8,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        '& b': {
          color: primary.light
        }
      }}
    />
  );
}

export default ChannelCreditSellerMessage;
