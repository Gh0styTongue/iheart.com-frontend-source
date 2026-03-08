import LogoSVG from './primitives/LogoSVG';

type Props = {
  className?: string;
  ignoreDefaultStyles?: boolean;
  dark?: boolean;
};

function SVGlogo({ className, dark, ignoreDefaultStyles = false }: Props) {
  return (
    <LogoSVG
      className={className}
      dark={dark}
      ignoreDefaultStyles={ignoreDefaultStyles}
    />
  );
}

export default SVGlogo;
