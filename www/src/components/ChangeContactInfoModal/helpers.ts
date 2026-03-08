export function filterNonDigits(phoneNumber = '') {
  return phoneNumber.replace(/\D/g, '');
}

export function countFormatDigits(format: string) {
  return format.replace(/[^d]/g, '').length;
}

export function countryNumberPlaceholder({
  callingCode,
  format,
  digitRange,
}: {
  callingCode: string;
  format?: string;
  digitRange?: [number, number];
}) {
  if (format) {
    return `+${callingCode} ${format.replace('?', '').replace(/d/g, 'X')}`;
  } else if (digitRange) {
    return `+${callingCode} ${'X'.repeat(digitRange[1])}`;
  } else {
    return `+${callingCode}`;
  }
}

export function internationalFormatRegex(callingCode: string, format: string) {
  // in order to use our format string as a regex we need to escape some characters.  This handles all of the cases
  // that we currently have, if other special characters are needed later then we may need add some escapes for those as well.
  const localRegex = format
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)')
    .replaceAll('d', '\\d');
  const internationalRegex = `\\+${callingCode}`;
  return new RegExp(`${internationalRegex} ${localRegex}`);
}

export function formatPhoneNumber(
  countryPhoneInfo: {
    callingCode: string;
    format?: string;
    digitRange?: [number, number];
  },
  phoneNumber: string,
): string {
  const { callingCode, format, digitRange } = countryPhoneInfo;

  const internationalExtension = `+${callingCode}`;

  // pull out the digits so we can interpolate them into the format string
  const currentDigits = filterNonDigits(
    phoneNumber.slice(callingCode.length + 1),
  );

  if (!phoneNumber?.length || internationalExtension.startsWith(phoneNumber)) {
    // enforce that new phone numbers begin with an international extension
    return `${internationalExtension} `;
  } else if (!format) {
    // for countries with a non-trivial format (nz has area codes that are 2-4 chars and the actual number is 6-7 chars)
    // which prevents simple parsing/formatting) ensure there's a country code, put a space after it and then enforce a
    // maximum length on the remainder (even though some numbers may be shorter in cases like NZ).
    return phoneNumber.startsWith('+') ?
        `${internationalExtension} ${currentDigits.slice(
          0,
          digitRange?.[1] ?? Infinity,
        )}`
      : `${internationalExtension} ${phoneNumber}`;
  } else if (!phoneNumber.startsWith('+')) {
    // if we have an existing number that does not have the plus, assume that it lacks a calling code and add it in
    // before recursing and acting like it was there the whole time.
    return formatPhoneNumber(
      countryPhoneInfo,
      // if we have more than the number of digits in the format then we can assume that just the + and not the calling code was ommitted
      // otherwise add the whole thing to the number.
      filterNonDigits(phoneNumber)?.length <= countFormatDigits(format) ?
        `${internationalExtension} ${phoneNumber}`
      : `+${phoneNumber}`,
    );
  }

  // interpolates each number in the input (other than the callingCode) into the 'd' chars in the format string
  const { formatted: formattedNumber } = format.split('').reduce(
    ({ formatted, digitIndex }, formatChar) => {
      const currentDigit = currentDigits[digitIndex];
      if (formatChar !== 'd' && currentDigit) {
        // we are looking at a char in the format string that is not a number and doesn't need interpolation
        // add it to the string and keep going until we find a 'd'.
        return {
          formatted: `${formatted}${formatChar}`,
          digitIndex,
        };
      } else if (formatChar === 'd' && currentDigit) {
        // we're at a 'd' in the format string, switch it out for the next digit in the input
        return {
          formatted: `${formatted}${currentDigit}`,
          digitIndex: digitIndex + 1,
        };
      } else {
        // if we're here then there aren't any new digits to interpolate so ignore the rest of the format string
        return {
          formatted,
          digitIndex,
        };
      }
    },
    // since we can compute the international extension regardless of country or input,
    // we tack it on here (it isn't included in the format string)
    { formatted: `${internationalExtension} `, digitIndex: 0 },
  );

  return formattedNumber;
}

export function isValidPhoneNumber(
  {
    callingCode,
    format,
    digitRange,
  }: { callingCode: string; format?: string; digitRange?: [number, number] },
  phoneNumber: string,
): boolean {
  // callingCode + plus sign before + space after
  const nonLocalChars = callingCode.length + 2;

  if (!phoneNumber || phoneNumber.length === nonLocalChars) return true;

  if (!format) {
    // for countries with a non-trivial format (nz has area codes that are 2-4 chars and the actual number is 6-7 chars)
    // which prevents simple parsing/formatting) ensure there's a number of chars equal to the callingCode plus 2
    // (for the plus before and the space after the callingCode) and between min and max digits after.
    // (the first and second elements in the digitRange tuple).

    // this case is hypothetical and handled for completeness's sake.
    if (!digitRange) return phoneNumber.length > nonLocalChars;

    return (
      phoneNumber.length >= digitRange[0] + nonLocalChars &&
      phoneNumber.length <= digitRange[1] + nonLocalChars
    );
  }

  const phoneNumberRegex = internationalFormatRegex(callingCode, format);

  const validate = phoneNumberRegex.test(phoneNumber);

  return validate;
}
