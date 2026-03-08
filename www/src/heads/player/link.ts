import oEmbedLinks from '../lib/oEmbedLinks';
import { MetaObject } from '../types';
import { metaResolveUrl } from 'utils/metaUtils';

type Props = {
  pagePath: string;
  siteUrl: string;
  title: string;
};

export default ({ pagePath, siteUrl, title }: Props): Array<MetaObject> => [
  ...oEmbedLinks(siteUrl, metaResolveUrl(siteUrl, pagePath), title),
];
