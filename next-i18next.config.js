const path = require('path');

module.exports = {
  debug: false,
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en']
  },
  reloadOnPrerender: false,
  localePath: path.resolve('./public/locales')
};
