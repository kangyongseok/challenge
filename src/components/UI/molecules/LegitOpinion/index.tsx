import type { HTMLAttributes } from 'react';

import { Avatar, Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';

import LegitLabel from '@components/UI/atoms/LegitLabel';

import type { LegitOpinion as ILegitOpinion } from '@dto/productLegit';

interface LegitOpinionProps extends HTMLAttributes<HTMLDivElement> {
  legitOpinion: ILegitOpinion;
}

function LegitOpinion({
  legitOpinion: {
    dateCreated,
    description,
    result,
    roleLegit: { image, name, ip, title, subTitle }
  },
  ...props
}: LegitOpinionProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  return (
    <Flexbox gap={12} {...props}>
      {image && (
        <Avatar
          width={32}
          height={32}
          src={image}
          alt="User Avatar Img"
          customStyle={{ minWidth: 32, maxHeight: 32, borderRadius: '50%' }}
        />
      )}
      <Box customStyle={{ flexGrow: 1 }}>
        <Flexbox justifyContent="space-between">
          <Flexbox gap={6} alignment="center" customStyle={{ flexGrow: 1 }}>
            <Typography weight="bold">{name}</Typography>
            {ip && (
              <Typography variant="small1" customStyle={{ color: common.ui60 }}>
                ({ip})
              </Typography>
            )}
          </Flexbox>
          {result === 1 && <LegitLabel text="정품의견" />}
          {result === 2 && <LegitLabel variant="fake" text="가품의심" />}
          {result !== 1 && result !== 2 && <LegitLabel variant="impossible" text="감정불가" />}
        </Flexbox>
        <Typography
          variant="body2"
          dangerouslySetInnerHTML={{
            __html: `${title.replaceAll(/\r?\n/gi, '<br />')}`
          }}
          customStyle={{ marginTop: 4, color: common.ui60 }}
        />
        <Typography variant="body2" customStyle={{ color: common.ui60 }}>
          {subTitle}
        </Typography>
        <Typography
          customStyle={{ marginTop: 8 }}
          dangerouslySetInnerHTML={{
            __html: `${description.replaceAll(/\r?\n/gi, '<br />')}`
          }}
        />
        <Typography variant="small2" customStyle={{ marginTop: 8, color: common.ui60 }}>
          {dayjs(dateCreated).format('YYYY.MM.DD HH:mm')}
        </Typography>
      </Box>
    </Flexbox>
  );
}

export default LegitOpinion;
