import Articles from 'components/Articles';
import Featuring from 'shared/ui/components/Featuring';
import PlayableArticle from 'shared/ui/components/PlayableArticle';
import Section from 'components/Section';
import transport from 'api/transport';
import { getArtistProfile } from 'state/Artists/services';
import { getArtistUrl } from 'utils/url';
import { Props } from './types';
import { PureComponent } from 'react';
import { THUMB_RES } from 'components/MediaServerImage';

export default class SimilarArtistAside extends PureComponent<Props> {
  componentDidMount() {
    const { artistId } = this.props;
    this.updateArtists(artistId);
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps({ artistId }: Props) {
    if (artistId !== this.props.artistId) {
      this.updateArtists(artistId);
    }
  }

  updateArtists(id: string) {
    const { ampUrl, artistProfileReceived } = this.props;
    transport(getArtistProfile({ ampUrl, id })).then(({ data }) =>
      artistProfileReceived(data),
    );
  }

  render() {
    const {
      playedFrom,
      artistId,
      artistName,
      relatedArtists = [],
      translate,
    } = this.props;
    return (
      <Section
        header={translate('Similar Artists')}
        url={`${getArtistUrl(+artistId, artistName)}similar/`}
      >
        <Articles
          articleClass={PlayableArticle}
          data={relatedArtists
            .slice(0, 3)
            .map(({ artistId: similarArtistId, name: similarArtistName }) => ({
              catalogId: similarArtistId,
              catalogType: 'artist',
              description: (
                <Featuring
                  artistId={similarArtistId}
                  key={`featuring${similarArtistId}`}
                />
              ),
              id: similarArtistId,
              imgWidth: THUMB_RES,
              playedFrom,
              title: similarArtistName,
              url: getArtistUrl(similarArtistId, similarArtistName),
            }))}
          key={`Articles|${artistId}`}
        />
      </Section>
    );
  }
}
