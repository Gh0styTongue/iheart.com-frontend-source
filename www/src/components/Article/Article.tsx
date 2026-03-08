import Description from './primitives/Description';
import ExplicitLyrics from 'components/ExplicitLyrics';
import factory from 'state/factory';
import ImageWrapper from './primitives/ImageWrapper';
import ListItem from './primitives/ListItem';
import MediaServerImage from 'components/MediaServerImage';
import MediaServerImagePrimitive from './primitives/MediaServerImagePrimitive';
import NavLink from 'components/NavLink';
import PlaylistImage from 'components/MediaServerImage/PlaylistImage';
import SearchLink from 'components/SearchLink/SearchLink';
import Text from './primitives/Text';
import Title from './primitives/Title';
import { fit, urlOps } from 'utils/mediaServerImageMaker/opsString';
import { FunctionComponent, ReactNode } from 'react';
import { getRegGateStationIds } from 'state/Config/selectors';
import { isPlaylist } from 'state/Playlist/helpers';
import { Data as ItemSelectedData } from 'modules/Analytics/helpers/itemSelected';
import { navigate } from 'state/Routing/actions';
import { newSearchDescription } from 'state/SearchNew/helpers';
import { REGGATE_TYPES } from 'constants/regGateTypes';
import { truncate } from 'utils/string';
import { useTranslate } from 'widget/hooks';

const EXTERNAL_LINK_REGEX = /^(\/\/)|(http:)|(https:)/i;

const store = factory();

const state = store.getState();

const NoLink: FunctionComponent<any> = ({ children }) => <>{children}</>;

type Props = {
  artistName: string;
  bestMatch?: boolean;
  catalogType: string;
  description: ReactNode;
  dropdown: ReactNode;
  explicitLyrics: boolean;
  filter?: any;
  header?: ReactNode;
  hidePadding?: boolean;
  imgHeight?: number;
  imgUrl: string;
  imgWidth?: number;
  itemSelected?: ItemSelectedData;
  onClick?: (event: MouseEvent) => void;
  search: boolean;
  supressDeepLink: boolean;
  thumbnail?: ReactNode;
  title?: string;
  typeLabel: ReactNode;
  url: string;
  showRegGate?: boolean;
  itemId?: number;
};

function Article({
  itemId,
  artistName,
  bestMatch = false,
  catalogType,
  description = '',
  dropdown,
  explicitLyrics,
  filter = '',
  header = null,
  hidePadding = false,
  imgHeight,
  imgUrl,
  imgWidth,
  itemSelected,
  onClick,
  search,
  supressDeepLink,
  thumbnail = null,
  title = '',
  typeLabel,
  url,
  showRegGate = false,
}: Props) {
  let LinkComponent = NoLink;
  if (url) LinkComponent = search ? SearchLink : NavLink;

  const translate = useTranslate();

  const target = EXTERNAL_LINK_REGEX.test(url) ? '_blank' : '';

  let urlWithRegGate = url;

  if (showRegGate) {
    const stationIds = getRegGateStationIds(state);
    if (stationIds.includes(Number(itemId))) {
      urlWithRegGate += `?showRegGate=${REGGATE_TYPES.STATION}`;
    }
  }

  return (
    <ListItem data-test="article-list-item" isSearch={search}>
      <ImageWrapper>
        <LinkComponent
          dataTest="article-link"
          href={urlWithRegGate}
          itemSelected={itemSelected}
          navigate={navigate}
          onClick={onClick}
          supressDeepLink={supressDeepLink}
          target={target}
          title={title}
          to={urlWithRegGate}
        >
          <MediaServerImagePrimitive isLiveThumb={catalogType === 'live'}>
            {thumbnail ||
              (isPlaylist(catalogType) ?
                <PlaylistImage
                  alt={title}
                  height={imgHeight}
                  src={imgUrl}
                  width={imgWidth}
                />
              : <MediaServerImage
                  alt={title}
                  ops={
                    imgWidth ?
                      [urlOps(imgUrl), fit(imgWidth, imgHeight || imgWidth)]
                    : [urlOps(imgUrl)]
                  }
                  src={imgUrl}
                />)}
          </MediaServerImagePrimitive>
        </LinkComponent>
      </ImageWrapper>
      <Text hasDropdown={!!dropdown} hidePadding={!!hidePadding}>
        {typeLabel}
        <Title data-test="article-title">
          {header || (
            <NavLink
              href={url}
              itemSelected={itemSelected}
              navigate={navigate}
              onClick={onClick}
              supressDeepLink={supressDeepLink}
              target={target}
              title={title}
              to={url}
            >
              {title}
            </NavLink>
          )}
        </Title>
        {filter === '' ?
          <Description data-test="article-description">
            {bestMatch &&
              (typeof description === 'string' ?
                truncate(description, 45)
              : description)}
            {!bestMatch &&
              newSearchDescription(translate, catalogType, artistName)}
          </Description>
        : <Description data-test="article-description">
            {typeof description === 'string' ?
              truncate(description, 45)
            : description}
          </Description>
        }
      </Text>
      <span>
        {explicitLyrics ?
          <ExplicitLyrics />
        : null}
      </span>
      {dropdown}
    </ListItem>
  );
}

export default Article;
