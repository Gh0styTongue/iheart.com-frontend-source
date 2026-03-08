/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

import IconSVG from './primitives/IconSVG';

type Props = {
  className?: string;
  name: string;
};

function Icon({ className, name }: Props) {
  const required = require(
    `!raw-loader!svgo-loader?svgoConfig!styles/icons/${name}.svg`,
  );
  const svg = required.default ?? required;

  return (
    // only place icons that are being used in the theme/icons folder, otherwise they may be bundled even if not used
    <IconSVG className={className} svg={svg} />
  );
}

export default Icon;
