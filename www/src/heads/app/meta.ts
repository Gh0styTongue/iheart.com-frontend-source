import colors from 'styles/colors';
import { MetaObject } from '../types';

export default (): Array<MetaObject> => [
  { content: 'on', 'http-equiv': 'x-dns-prefetch-control' },
  { charset: 'utf-8' },
  {
    content:
      'width=device-width, initial-scale=1, maximum-scale=5.0, user-scalable=yes',
    name: 'viewport',
  },
  { content: 'yes', name: 'mobile-web-app-capable' },
  { content: colors.red.primary, name: 'theme-color' },
];
