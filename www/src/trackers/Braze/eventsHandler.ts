import Events from 'modules/Analytics/constants/events';
import logger from 'modules/Logger';
import {
  BRAZE_CUSTOM_EVENTS,
  BrazeTracking,
  eventKeyMap,
  getScreenPropsForUpsellSong2Start,
  trackedEvents,
} from './helpers';
import type { EventName } from 'modules/Analytics/types';
import type { EventsHandler, EventTypeMap } from 'trackers/types';

const eventsHandler: EventsHandler = (eventName, payload) => {
  if (trackedEvents.includes(eventName)) {
    const mappedEventName = eventKeyMap[eventName as EventName] ?? eventName;
    logger.info(
      'Tracking Braze event:',
      mappedEventName,
      payload as Record<string, unknown>,
    );
    switch (mappedEventName) {
      case BRAZE_CUSTOM_EVENTS.AAPreview: {
        const {
          artistId,
          artistName,
          curated,
          currentAlbumId,
          currentAlbumTitle,
          isTrialEligible,
          playedFromTrigger,
          playlistId,
          playlistName,
          playlistUserId,
          stationType,
          subscriptionType,
          trackId,
          trackName,
          type,
        } = payload as EventTypeMap[typeof Events.UpsellOpen];
        const upsellData = {
          artistId,
          artistName,
          trackId,
          trackName,
          ...BrazeTracking({
            curated,
            isTrialEligible,
            subscriptionType,
            playedFromTrigger,
          }),
          ...getScreenPropsForUpsellSong2Start({
            artistId,
            artistName,
            currentAlbumId,
            currentAlbumTitle,
            playlistId,
            playlistName,
            playlistUserId: String(playlistUserId),
            stationType,
          }),
          type,
        };
        window.braze?.logCustomEvent(mappedEventName, upsellData);
        break;
      }
      case BRAZE_CUSTOM_EVENTS.PageView: {
        const { pathname } = window.location;

        const { id, name } = payload as EventTypeMap[typeof Events.PageView];

        const [type, identifier] = String(id ?? '').split('|');

        const isHighlight = pathname.includes('highlights');

        window.braze?.logCustomEvent(
          mappedEventName,
          isHighlight ?
            {
              type: 'highlights',
            }
          : {
              identifier,
              location: pathname,
              name,
              type,
            },
        );
        break;
      }
      case Events.RegGateExit:
        window.braze
          ?.getUser()
          ?.setEmailNotificationSubscriptionType(
            (payload as EventTypeMap[typeof Events.RegGateExit]).optIn ?
              braze.User.NotificationSubscriptionTypes.OPTED_IN
            : braze.User.NotificationSubscriptionTypes.SUBSCRIBED,
          );
        break;
      case BRAZE_CUSTOM_EVENTS.HighlightsStreamStart: {
        window.braze?.logCustomEvent('Stream_Start', {
          type: 'highlights',
        });

        break;
      }
      case BRAZE_CUSTOM_EVENTS.StreamStart: {
        const { station, subType } =
          payload as EventTypeMap[typeof Events.StreamStart];

        const artistId = station.get('artistId');
        const curatedPlaylist = station.get('curated');
        const id = station.get('id');
        const name = station.get('artistName') || station.get('name');
        const ownerId = station.get('ownerId');
        const typeMap = {
          artist: 'custom',
          collection: curatedPlaylist ? 'playlist' : 'playlist_ug',
          playlistradio: 'playlist',
          mymusic: 'mymusic',
          live: 'live',
          podcast: 'podcast',
        };
        const type = station.get('seedType') as keyof typeof typeMap;

        const subscriptionType =
          subType.charAt(0).toUpperCase() + subType.toLowerCase().slice(1);

        const identifier = String(id).replace('/', '::');

        const myMusicType =
          type === 'mymusic' ?
            window.location.pathname.split('/')[2]
          : undefined;

        const stationType = typeMap[type];

        window.braze?.logCustomEvent(mappedEventName, {
          artistId,
          identifier,
          myMusicType,
          name,
          ownerId,
          subscriptionType,
          type: stationType,
        });

        break;
      }
      case BRAZE_CUSTOM_EVENTS.Upsell: {
        const {
          artistId,
          artistName,
          curated,
          currentAlbumId,
          currentAlbumTitle,
          isTrialEligible,
          playedFromTrigger,
          playlistId,
          playlistName,
          playlistUserId,
          stationType,
          subscriptionType,
          trackId,
          trackName,
          type,
        } = payload as EventTypeMap[typeof Events.UpsellOpen];
        const upsellData = {
          artistId,
          artistName,
          trackId,
          trackName,
          ...BrazeTracking({
            curated,
            isTrialEligible,
            subscriptionType,
            playedFromTrigger,
          }),
          ...getScreenPropsForUpsellSong2Start({
            artistId,
            artistName,
            currentAlbumId,
            currentAlbumTitle,
            playlistId,
            playlistName,
            playlistUserId: String(playlistUserId),
            stationType,
          }),
          type,
        };
        window.braze?.logCustomEvent(mappedEventName, upsellData);

        break;
      }
      default:
        window.braze?.logCustomEvent(mappedEventName, payload as never);
    }
  }
};

export default eventsHandler;
