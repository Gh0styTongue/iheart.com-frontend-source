import composeRequest, { header, method, query, urlTagged } from 'api/helpers';
import graphQL from 'api/graphql';

export function getArtistByArtistId({ ampUrl, countryCode, artistId }) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v1/catalog/getArtistByArtistId`,
    query({ artistId, countryCode }),
  )();
}

export function getSimilars({ ampUrl, id }) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v1/catalog/artist/${{
      artistId: id,
    }}/getSimilar`,
    header('Accept', 'application/json'),
  )();
}

export function getLiveStationForArtist({ ampUrl, id }) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v1/recs/getBestLiveRadioStationsByArtist`,
    query({
      amount: 1,
      artistId: id,
    }),
  )();
}

export function getArtistProfile({ ampUrl, id }) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v3/artists/profiles/${{ artistId: id }}`,
  )();
}

export function getArtistData({ baseUrl, id, articles, locale }) {
  return graphQL(
    baseUrl,
    { articles, artistId: id, locale },
    `
    query Artist($artistId: Int!, $articles: Int!, $locale: String) {
      artist(artistId: $artistId) {
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
      }
    }
  `,
  );
}
