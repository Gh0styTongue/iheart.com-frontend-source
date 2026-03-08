import composeRequest, {
  header,
  method,
  query,
  requestName,
  transformResponse,
  url,
} from './helpers';
import safeStringify from 'utils/safeStringify';

export default function graphQL(
  endpoint = '',
  variables = {},
  req = '',
  errorHandler = <T>(arg: T) => arg,
) {
  const composedRequest = composeRequest(
    requestName(endpoint.includes('webapi') ? 'webApi' : 'graphQL'), // differentiate between webapi calls and general graphQl calls
    url(endpoint),
    method('GET'),
    header('content-type', 'application/json'),
    query({
      query: req.replace(/\s+/g, ' '),
      variables: safeStringify(variables),
    }),
    transformResponse(data => JSON.parse(data)),
    transformResponse(data => (data.errors ? errorHandler(data) : data)),
  )();
  return composedRequest;
}
