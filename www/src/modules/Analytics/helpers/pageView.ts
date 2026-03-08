import Events from '../constants/events';
import { composeEventData, namespace, property } from '../factories';

export type Data = Readonly<{
  author_id?: string;
  contentFrame?: string;
  contentId?: string;
  contentOrigin?: string;
  contentOriginType?: string;
  filterLocation?: string;
  filterName?: string;
  filterType?: string;
  formattedTopics?: Array<string>;
  id?: string;
  inNetwork?: string;
  name?: string;
  pageHost?: string;
  pageName: string;
  pageURL?: string;
  personalityId?: string;
  photoGalleryExists?: boolean;
  photoGalleryPageView?: boolean;
  pubDate?: string;
  stationCallLetter?: string;
  stationFormat?: string;
  stationMarket?: string;
  stationMicroSite?: string;
  subId?: string;
  subName?: string;
  tags?: string;
}>;

export type PageView = Readonly<{
  pageName: string;
  view?: {
    asset?: {
      id: string;
      name: string;
      sub?: {
        id: string;
        name: string;
      };
    };
    authorId?: string;
    contentFrame?: string;
    contentId?: string;
    contentOrigin?: string;
    contentOriginType?: string;
    filter?: {
      location?: string;
      name?: string;
      type?: string;
    };
    pageURL?: string;
    personalityId?: string;
    photoGalleryExists?: boolean;
    photoGalleryPageView?: boolean;
    pubDate?: string;
    stationCallLetter?: string;
    stationFormat?: string;
    stationMarket?: string;
    stationMicroSite?: string;
    tags?: string;
    topics?: Array<string>;
  };
}>;

function truncateAnalyticsURL(url: string, start: number, end: number): string {
  return url?.length >= end ? `${url.slice(start, end - 4)}...` : url;
}

function pageView(data: Data): PageView {
  const eventData = composeEventData(Events.PageView)(
    property('pageName', data.pageName, true),
    namespace('view')(
      namespace('asset')(
        property('id', data.id),
        property('name', data.name),
        namespace('sub')(
          property('id', data.subId),
          property('name', data.subName),
        ),
      ),
      property('authorId', data.author_id),
      property('contentFrame', data.contentFrame || 'page', true),
      property('contentId', data.contentId),
      property('contentOrigin', data.contentOrigin),
      property('contentOriginType', data.contentOriginType),
      namespace('filter')(
        property('location', data.filterLocation),
        property('name', data.filterName),
        property('type', data.filterType),
      ),
      property(
        'pageURL',
        truncateAnalyticsURL(data.pageURL || window.location.href, 0, 1000),
      ),
      property('personalityId', data.personalityId),
      property('photoGalleryExists', data.photoGalleryExists),
      property('photoGalleryPageView', data.photoGalleryPageView),
      property('pubDate', data.pubDate),
      property('stationCallLetter', data.stationCallLetter),
      property('stationFormat', data.stationFormat),
      property('stationMarket', data.stationMarket),
      property('stationMicroSite', data.stationMicroSite),
      property('tags', data.tags),
      property('topics', data.formattedTopics),
    ),
  ) as PageView;
  return eventData;
}

export default pageView;
