import graphQL from 'api/graphql';

type Props = {
  baseUrl: string;
  limit?: number;
  locale: string;
};

export function getEvents({ baseUrl, limit = 2, locale }: Props) {
  return graphQL(
    baseUrl,
    {
      locale,
      query: {
        limit,
        subscription: {
          tags: ['collections/web-homeevents'],
        },
      },
    },
    `
    query Events($query: QueryInput!, $locale: String) {
      events: leads(query: $query, locale: $locale) {
        title
        link {
          urls {
            web
          }
        }
        img_uri
      }
    }
    `,
  );
}
