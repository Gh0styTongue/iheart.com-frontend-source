import composeRequest, {
  authHeaders,
  body,
  method,
  query,
  urlTagged,
} from 'api/helpers';
import graphQL from 'api/graphql';

export function getGenres({
  ampUrl,
  genreType,
}: {
  ampUrl: string;
  genreType: string;
  countryCode?: string;
}) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v3/catalog/genres`,
    query({ genreType }),
  )();
}

export function getUserGenres({
  ampUrl,
  profileId,
  sessionId,
}: {
  ampUrl: string;
  profileId: number;
  sessionId: string;
}) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v2/taste/${{ profileId: String(profileId) }}`,
    authHeaders(profileId, sessionId),
    method('get'),
  )();
}

export function saveUserGenres({
  ampUrl,
  genreIds,
  profileId,
  sessionId,
  skipped,
}: {
  ampUrl: string;
  genreIds: Array<number>;
  profileId: number;
  sessionId: string;
  skipped: boolean;
}) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v3/profiles/tasteProfile/genres`,
    authHeaders(profileId, sessionId),
    method('put'),
    body({ genreIds, skipped }),
  )();
}

export function getGenreData({
  baseUrl,
  id,
  locale,
}: {
  articles?: number;
  baseUrl: string;
  id: number | string;
  locale: string;
}) {
  return graphQL(
    baseUrl,
    { articles: 10, genreId: id, locale },
    `
    query Genre($genreId: Int!, $articles: Int!, $locale: String) {
      genre(genreId: $genreId) {
        leads(locale: $locale) {
          backgroundColor:background_color
          primaryBackgroundSrc:img_uri
        }
        content(num: $articles) {
          ref_id	
          slug	
          pub_start	
          pub_changed	
          ad_params {	
            keywords	
            topics	
          }	
          payload {	
            blocks	
            fb_allow_comments	
            keywords	
            publish_origin	
            cuser	
            canonical_url	
            external_url	
            is_sponsored	
            amp_enabled	
            seo_title	
            social_title	
            feed_permalink	
            feed_vendor	
            show_updated_timestamp	
          }	
          summary {	
            title	
            description	
            image	
            author	
          }	
          subscription {	
            tags	
          }
        }
        genre {
          site {
            config {
              config {
                ... on SiteConfig {
                  partners {
                    ihr_stream {
                      id
                    }
                  }
                  design {
                    ihr_hero_image
                    ihr_hero_color
                  }
                }
              }
            }
            timeline {
              ad_params {
                topics
                keywords
              }
              payload {
                canonical_url
                cuser
                blocks
                external_url
                is_sponsored
                feed_vendor
                permalink
              }
              slug
              summary {
                image
                title
              }
            }
          }
        }
      }
    }
  `,
  );
}
