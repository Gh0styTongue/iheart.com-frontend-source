import ArticleList from './primitives/ArticleList';
import DateText from './primitives/DateText';
import format from 'date-fns/format';
import LoadMoreButton from './primitives/LoadMoreButton';
import MediaServerImage from 'components/MediaServerImage';
import NavLink from 'components/NavLink';
import Title from './primitives/Title';
import Wrapper from './primitives/Wrapper';
import { ArticleMeta } from 'state/News/types';
import { cover, gravity } from 'utils/mediaServerImageMaker/opsString';

export type Props = {
  articles: Array<ArticleMeta>;
  hasMoreArticles: boolean;
  loadMore: () => void;
};

function NewsGrid({ articles, hasMoreArticles, loadMore }: Props) {
  if (!articles || !articles.length) return null;

  return (
    <ArticleList data-test="article-list">
      {articles.map(
        ({
          canonical_url: canonicalUrl,
          title,
          image,
          pub_start: pubDate,
          slug,
        }) => (
          <Wrapper data-test="news-item-wrapper" key={slug}>
            <NavLink dataTest="img-link" to={canonicalUrl}>
              <MediaServerImage
                alt={title}
                aspectRatio={16 / 9}
                ops={[gravity('north'), cover(720, 404)]}
                src={image}
              />
            </NavLink>
            <NavLink dataTest="title-link" to={canonicalUrl}>
              <Title lines={2}>{title}</Title>
            </NavLink>
            <DateText data-test="date-text">
              {format(new Date(pubDate), 'MMMM D, YYYY')}
            </DateText>
          </Wrapper>
        ),
      )}
      {hasMoreArticles && (
        <LoadMoreButton data-test="load-more-articles" onClick={loadMore}>
          Load More
        </LoadMoreButton>
      )}
    </ArticleList>
  );
}

export default NewsGrid;
