import { PlayerUIErrors } from 'web-player/constants';

export const getMessage = (error: PlayerUIErrors) => {
  const messages = {
    [PlayerUIErrors.PodcastInvalidMedia]: () =>
      "There's an error with episodes for this show.",
    [PlayerUIErrors.GenericInvalidMedia]: () =>
      "There's an error with this content.",
  };

  return messages[error]();
};
