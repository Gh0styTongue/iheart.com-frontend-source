import graphQL from 'api/graphql';

export default function radioEditRedirect(baseUrl: string, path: string) {
  return graphQL(
    baseUrl,
    {
      path,
      site: 'default',
    },
    `
      query Redirect($site: String!, $path: String!) {
        sites {
          find(type: SLUG, value: $site) {
            canonicalHostname
            configByLookup(lookup: "site-config-lookups/live") {
              redirect(path: $path) {
                destination
                permanent
              }
            }
          }
        }
      }
    `,
  );
}
