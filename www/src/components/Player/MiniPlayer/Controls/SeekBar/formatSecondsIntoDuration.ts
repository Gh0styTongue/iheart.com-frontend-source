function formatDigit(digit: number): string {
  return `${digit < 10 ? '0' : ''}${digit}`;
}

function formatSecondsIntoDuration(time: number): string {
  if (time === Number.POSITIVE_INFINITY || time === Number.NEGATIVE_INFINITY)
    return '';
  const hours = Math.floor(time / 60 / 60) % 60;
  const minutes = Math.floor(time / 60) % 60;
  const seconds = Math.floor(time % 60);
  const duration = [
    hours > 0 ? formatDigit(minutes) : minutes,
    formatDigit(seconds),
  ];
  if (hours > 0) duration.unshift(hours);
  return duration.join(':');
}

export default formatSecondsIntoDuration;
