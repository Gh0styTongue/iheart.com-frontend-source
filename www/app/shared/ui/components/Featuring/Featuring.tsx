import NavLink from 'components/NavLink';
import transport from 'api/transport';
import withCancel, { CancelablePromise } from 'utils/withCancel';
import { get } from 'lodash-es';
import { getArtistUrl } from 'utils/url';
import { getSimilarArtistVarietyMap } from 'state/Artists/helpers';
import { getSimilars } from 'state/Artists/services';
import { IGetTranslateFunctionResponse } from 'redux-i18n';
import { PureComponent } from 'react';
import { Variety } from 'state/Artists/types';

type SimilarsViewModel = {
  title: string;
  url: string;
};

type Props = {
  ampUrl: string;
  artistId: number;
  links?: Array<SimilarsViewModel>;
  numberOfFeatures?: number;
  translate: IGetTranslateFunctionResponse;
  truncate?: number;
  variety: Variety;
};

type State = {
  links?: Array<SimilarsViewModel>;
};

export default class Featuring extends PureComponent<Props, State> {
  asyncData: CancelablePromise<State> | null = null;

  static defaultProps = {
    truncate: 1000,
    variety: 'TOP_HITS',
  };

  state = {
    links: undefined,
  };

  componentDidMount(): void {
    this.asyncData = withCancel(this.getInitialStateAsync());
    this.asyncData.then(data => this.setState(data));
  }

  componentWillUnmount(): void {
    if (this.asyncData) this.asyncData.cancel();
  }

  getInitialStateAsync = (): Promise<State> => {
    const { variety } = this.props;
    const { artistId, ampUrl } = this.props;
    return transport(getSimilars({ ampUrl, id: artistId })).then(response => {
      const similars = getSimilarArtistVarietyMap(
        get(response, ['data', 'similarArtists']),
      );
      if (!similars || !similars[variety] || !similars[variety].length) {
        return {};
      }

      return {
        links: similars[variety].slice(0, 3).map((a: any) => ({
          title: a.artistName,
          url: getArtistUrl(a.artistId, a.artistName),
        })),
      };
    });
  };

  getTruncatedLinks = (links: Array<SimilarsViewModel>) => {
    const { truncate } = this.props;
    const truncatedLinks: Array<any> = [];
    let chars = 15;
    // Get length of each Feat artist and see if it fits in the X chars of the truncation
    links.forEach(thisLink => {
      const len = thisLink.title.length;
      if (chars + len + 2 <= truncate!) {
        chars += len + 2;
        truncatedLinks.push(thisLink);
      }
    });

    return truncatedLinks;
  };

  render() {
    const { links: propLinks, translate, numberOfFeatures } = this.props;
    const links = this.state.links || propLinks;

    if (!links) return <p />;

    const truncatedLinks = this.getTruncatedLinks(links);

    return (
      <p>
        {translate('Feat. {artistNames} and more', {
          artistNames: truncatedLinks.slice(0, numberOfFeatures).map((l, i) => (
            <span key={l.title + l.url}>
              <NavLink title={l.title} to={l.url}>
                {l.title}
              </NavLink>
              {i < truncatedLinks.length - 1 ? ', ' : ''}
            </span>
          )),
        })}
      </p>
    );
  }
}
