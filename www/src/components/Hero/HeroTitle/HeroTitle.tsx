import Title from './primitives/Title';

type Props = {
  clamp?: boolean;
  clampLines?: number;
  text?: string;
};

function HeroTitle({ text, clamp = false, clampLines = 2 }: Props) {
  if (!text) return null;

  return clamp ? <Title lines={clampLines}>{text}</Title> : <span>{text}</span>;
}

export default HeroTitle;
