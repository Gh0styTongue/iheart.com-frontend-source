import Article from 'components/Article';
import ArticleList from './primitives/ArticleList';
import factory from 'state/factory';
import { getIsAnonymous } from 'state/Session/selectors';
import { getIsStationSpecificRegGateEnabled } from 'state/Features/selectors';
import { ReactType } from 'react';

const store = factory();

const state = store.getState();

type Props = {
  articleClass: ReactType;
  bestMatch?: boolean;
  data: Array<{
    [a: string]: any;
  }>;
  dataTest?: string;
  filter?: any;
  hidePadding?: boolean;
  search?: boolean;
  supressDeepLink?: boolean;
};

function Articles({
  bestMatch = false,
  articleClass: ArticleClass = Article,
  data = [],
  dataTest,
  filter = '',
  hidePadding = false,
  search,
  supressDeepLink,
}: Props) {
  const isAnonymous = getIsAnonymous(state);
  let isStationSpecificRegGate = false;
  if (isAnonymous) {
    isStationSpecificRegGate = getIsStationSpecificRegGateEnabled(state);
  }
  return (
    <ArticleList data-test="article-list">
      {data.map(article => (
        <ArticleClass
          {...article}
          bestMatch={bestMatch}
          dataTest={dataTest}
          dropdownExtendDown={article.firstTrack}
          filter={filter}
          hidePadding={hidePadding}
          itemId={article.id}
          key={`${article.id}-${article.title}`}
          search={search}
          showRegGate={isStationSpecificRegGate}
          supressDeepLink={supressDeepLink}
        />
      ))}
    </ArticleList>
  );
}

export default Articles;
