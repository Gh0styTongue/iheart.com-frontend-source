import hub, { E } from 'shared/utils/Hub';

function Title() {
  this.title = '';
  hub.on(E.TRACK_CHANGED, this.onTrackLoaded, this);
  hub.on(E.CARD_CHANGE, data => {
    if (data.title) {
      let { title } = data;
      if (data.route !== '') title += ' | iHeart';
      this.set(title);
    } else {
      this.set(document.title); // no title given?  use the default
    }
  });
}

Title.prototype.onTrackLoaded = function onTrackLoaded(track, station) {
  if (!track) {
    this.reset(station);
    return;
  }

  if (['synced', 'adswizz'].includes(track.get('type'))) {
    this.set('Thanks for listening! | iHeart', true);
    return;
  }

  let title = track.get('title');
  const subtitle = track.get('artistName') || track.get('show');

  if (!title && !subtitle) {
    this.reset(station);
    return;
  }

  if (subtitle) title += ` | ${subtitle}`;

  this.set(`\u266B ${title}`, true);
};

Title.prototype.set = function set(title, isTempTitle) {
  document.title = title || 'iHeart';

  if (!isTempTitle) {
    this.title = document.title;
  }
};

Title.prototype.reset = function reset(station) {
  if (station) {
    const name = station.get('name');
    const description = station.get('description');
    const stationTitle = `\u266B ${name} | ${description || 'iHeart'}`;
    this.set(stationTitle, true);
  } else {
    document.title = this.title || document.title;
  }
};

export default Title;
