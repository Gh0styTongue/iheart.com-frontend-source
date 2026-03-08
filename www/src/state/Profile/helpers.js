import getYear from 'date-fns/get_year';

// http://www.kalzumeus.com/2010/06/17/falsehoods-programmers-believe-about-names/
export function abbreviateName(name) {
  const splitName = name.split(' ');
  const firstName = splitName[0];
  if (splitName.length > 1) {
    const lastName = splitName[splitName.length - 1];
    const lastInitial = lastName[0];
    return `${firstName} ${lastInitial}.`;
  }
  return firstName;
}

export function getYearDiff(from, to = Date.now()) {
  const fromYear = getYear(new Date(from));
  const toYear = getYear(new Date(to));
  return Math.floor(toYear - fromYear);
}

export function getBestUsername(name, email) {
  if (name) {
    // this happens :(
    if (name.indexOf('@') >= 0) {
      return name.split('@')[0];
    }
    return abbreviateName(name);
  }
  if (email) {
    return email.split('@')[0];
  }
  return null;
}

export function truncateIfNecessary(maxLength, text) {
  if (text && text.length > maxLength) {
    return `${text.slice(0, maxLength - 3)}...`;
  }
  return text;
}
