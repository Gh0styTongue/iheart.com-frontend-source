import graphQL from 'api/graphql';

export function getArticle({
  baseUrl,
  slug,
}: {
  baseUrl: string;
  slug: string;
}) {
  return graphQL(
    baseUrl,
    { slug },
    `
      query Content($slug: String!){
        content {
          item: slug(slug: $slug) {
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
              include_recommendations
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
        pubsub {
          get(type: "content", select:{slug: $slug}) {
            lookup
          }
        }
      }
    `,
  );
}

export function getNewsArticles({
  baseUrl,
  slug,
  topicSlug,
  pageResumeParams = null,
}: {
  baseUrl: string;
  slug: string;
  topicSlug?: string;
  pageResumeParams?: boolean | null;
}) {
  const feedParams =
    pageResumeParams ||
    (topicSlug ?
      {
        context: { '<topic>': `collections/${topicSlug}` },
        id: 'USAGE:feed-usecases/Default Topic',
        size: 12,
      }
    : {
        id: 'USAGE:feed-usecases/Default Content',
        size: 12,
      });

  return graphQL(
    baseUrl,
    { feedParams, slug },
    `
      query NewsDirectory($slug: String!, $feedParams: SitesFeedResumeInput!) {
        sites {
          find(type: SLUG, value: $slug) {
            config: configByLookup(lookup: "site-config-lookups/live") {
              timeline: feed(
                params: $feedParams
              ) {
                results {
                  data
                  type
                }
                resume {
                  id
                  context
                  scopes
                  size
                  from
                }
              }
            }
          }
        }
      }
    `,
  );
}

export function getTopic({
  baseUrl,
  topicSlug,
}: {
  baseUrl: string;
  topicSlug: string;
}) {
  return graphQL(
    baseUrl,
    { topicSlug },
    `
      query Topics($topicSlug: String!) {
        taxonomy {
            topic(topic: $topicSlug) {
                name
                source {
                    display_name
                    description
                }
            }
        }
      }
    `,
  );
}
