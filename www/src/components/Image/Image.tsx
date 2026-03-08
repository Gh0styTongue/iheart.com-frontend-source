import Background from './primitives/Background';
import Img from './primitives/Img';
import Wrapper from './primitives/Wrapper';
import { placeholder } from 'constants/assets';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

export type Props = {
  'data-test'?: string;
  alt: string;
  aspectRatio?: number;
  background?: boolean;
  children?: ReactNode;
  className?: string;
  crossOrigin?: boolean;
  defaultSrc?: string;
  onError?: (e: Event | string) => void;
  onLoad?: (e: Event) => void;
  src?: string;
};

function Image({
  'data-test': dataTest,
  alt,
  background = false,
  children,
  className = 'image',
  crossOrigin = false,
  defaultSrc = placeholder,
  onError,
  onLoad,
  ...props
}: Props) {
  const [aspectRatio, setAspectRatio] = useState<number>(
    props.aspectRatio ?? 0,
  );
  const [loaded, setLoaded] = useState<boolean>(!__CLIENT__);
  const [src, setSrc] = useState<string>(props.src ?? defaultSrc);
  const mounted = useRef<boolean>(false);

  useEffect(() => {
    setLoaded(false);
    setSrc(props.src ?? defaultSrc);
  }, [defaultSrc, props.src]);

  const handleOnError = useCallback(
    (e: Event | string) => {
      if (!mounted.current) return;
      onError?.(e);
      setLoaded(true);
      setSrc(defaultSrc);
    },
    [defaultSrc, onError],
  );

  const handleOnLoad = useCallback(
    (e: Event) => {
      if (!mounted.current) return;
      onLoad?.(e);
      setLoaded(true);
      const { height, width } = e.currentTarget as HTMLImageElement;
      if (aspectRatio > 0 || height <= 0) return;
      setAspectRatio(width / height);
    },
    [aspectRatio, onLoad],
  );

  useEffect(() => {
    mounted.current = true;
    const img = document.createElement('img');
    if (crossOrigin) img.crossOrigin = 'anonymous';
    img.onerror = handleOnError;
    img.onload = handleOnLoad;
    img.src = src;

    return () => {
      mounted.current = false;
      img.onerror = null;
      img.onload = null;
    };
  }, [crossOrigin, handleOnError, handleOnLoad, src]);

  return (
    <Wrapper
      aspectRatio={aspectRatio}
      className={className}
      data-test={dataTest}
      loaded={loaded}
    >
      <div>
        {background || children ?
          <Background data-src={src} title={alt}>
            {children}
          </Background>
        : <Img
            alt={alt}
            crossOrigin={crossOrigin ? 'anonymous' : undefined}
            loading="lazy"
            src={src}
          />
        }
      </div>
    </Wrapper>
  );
}

export default Image;
