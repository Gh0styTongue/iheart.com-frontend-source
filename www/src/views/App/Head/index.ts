import Head from './Head';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import {
  getAmpUrl,
  getContentUrl,
  getLeadsUrl,
  getMediaServerUrl,
  getReGraphQlUrl,
} from 'state/Config/selectors';
import { State } from 'state/buildInitialState';

export default connect(
  createStructuredSelector<
    State,
    {
      ampUrl: string;
      contentUrl: string;
      leadsUrl: string;
      mediaServerUrl: string;
      reGraphQlUrl: string;
    }
  >({
    ampUrl: getAmpUrl,
    contentUrl: getContentUrl,
    leadsUrl: getLeadsUrl,
    mediaServerUrl: getMediaServerUrl,
    reGraphQlUrl: getReGraphQlUrl,
  }),
)(Head);
