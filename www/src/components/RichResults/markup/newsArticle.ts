import { NewsArticleMarkup } from '../types';

const getNewsArticleMarkup = (meta: NewsArticleMarkup) => {
  const {
    articleBody,
    author,
    dateModified,
    datePublished,
    headline,
    image,
    publisher,
  } = meta as NewsArticleMarkup;
  return {
    '@context': 'https://schema.org/',
    '@type': 'NewsArticle',
    articleBody,
    author,
    dateModified,
    datePublished,
    headline,
    image,
    publisher,
  };
};

export default getNewsArticleMarkup;
