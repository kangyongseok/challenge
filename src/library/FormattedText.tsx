import { forwardRef } from 'react';

import { useTranslation } from 'next-i18next';
import type { TypographyProps } from 'mrcamel-ui/dist/components/Typography';
import { Typography } from 'mrcamel-ui';

interface FormattedTextProps extends TypographyProps {
  id: string;
  params?: Record<string, string | number>;
  isHtml?: boolean;
}

const FormattedText = forwardRef<HTMLDivElement, FormattedTextProps>(function FormattedMessage(
  { id, params = {}, isHtml = false, ...props },
  ref
) {
  const { t } = useTranslation();
  const value = t(id, params);

  return isHtml ? (
    <Typography
      ref={ref}
      dangerouslySetInnerHTML={{ __html: value.replace(/\\n/gi, '<br />') }}
      {...props}
    />
  ) : (
    <Typography ref={ref} {...props}>
      {value}
    </Typography>
  );
});

export default FormattedText;
