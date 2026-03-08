import { Article, State } from '../types';

const articleLoaded = (state: State, payload: { articles: Array<Article> }) => {
  const encodedArticles = payload.articles.reduce((memo, article) => {
    // WEB-8362 we encode html to prevent script tags that close in internal html blocks
    // confusing the browser and breaking code the page rendering logic
    const newBlocks = article.blocks.map(
      ({ html = '', attributes = { html: '' }, ...rest }) => ({
        ...rest,
        attributes: {
          ...attributes,
          html: attributes.html ? encodeURI(attributes.html) : attributes.html,
        },
        html: encodeURI(html),
      }),
    );

    // IHRWEB-15163 - the article could have been renamed.
    // Attempt to key articles based on the querySlug, which matches the url slug
    const articleKey = article?.querySlug ?? article.slug;
    return { ...memo, [articleKey]: { ...article, blocks: newBlocks } };
  }, {});

  return {
    ...state,
    articles: encodedArticles,
    status: { requestingArticle: false },
  };
};

export default articleLoaded;
