export function PlayerError(type, msg, payload, constr) {
  if (Error.captureStackTrace) Error.captureStackTrace(this, constr || this);
  this.message = msg || 'PlayerError';
  this.type = type || 'UNKNOWN';
  this.payload = payload;
}
PlayerError.prototype = new Error();
PlayerError.prototype.constructor = PlayerError;
PlayerError.prototype.name = 'PlayerError';
