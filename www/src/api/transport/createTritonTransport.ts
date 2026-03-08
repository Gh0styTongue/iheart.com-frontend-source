import axios from 'axios';

export const createTritonTransport = (baseURL: string) =>
  axios.get(baseURL, {
    withCredentials: true,
  });

export default createTritonTransport;
