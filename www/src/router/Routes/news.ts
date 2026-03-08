import ContentArticle from 'views/News/ContentArticle';
import Legacy from 'views/News/Legacy';
import NewsDirectory from 'views/News/NewsDirectory';
import paths from './paths';
import TopicDirectory from 'views/News/TopicDirectory';

// IHRWEB-17243 TODO these should use the Refresh View
// once the radioedit proxy for news & content is in prod
export default [
  {
    component: ContentArticle,
    exact: true,
    path: paths.news.contentArticle,
  },
  {
    component: Legacy,
    exact: true,
    path: paths.news.legacy,
  },
  {
    component: NewsDirectory,
    exact: true,
    path: paths.news.directory,
  },
  {
    component: TopicDirectory,
    exact: true,
    path: paths.news.topicDirectory,
  },
];
