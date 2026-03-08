import useTranslate from 'contexts/TranslateContext/useTranslate';
import { ReactNode, useEffect, useRef, useState } from 'react';

type Props = {
  'data-test'?: string;
  children: ReactNode;
  className?: string;
  lines?: number;
  onToggle?: () => void;
  shouldExpand?: boolean;
  shouldExpandColor?: 'dark' | 'light';
};

function Truncate({
  'data-test': dataTest,
  children,
  className,
  lines = 1,
  onToggle,
  shouldExpand = false,
  shouldExpandColor = 'dark',
}: Props) {
  const [canExpand, setCanExpand] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const innerRef = useRef<HTMLSpanElement | null>(null);
  const outerRef = useRef<HTMLParagraphElement | null>(null);
  const translate = useTranslate();

  useEffect(() => {
    const { current: paragraph } = outerRef;
    const { current: span } = innerRef;
    if (!paragraph || !span || !shouldExpand) return;
    setCanExpand(paragraph.offsetHeight < span.offsetHeight);
  }, [lines, shouldExpand, children]);

  function toggle() {
    setExpanded(state => !state);
    onToggle?.();
  }

  return (
    <>
      <p
        className={className}
        css={{
          margin: 0,
          wordBreak: 'break-word',
          ...(expanded ?
            {}
          : {
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              boxOrient: 'vertical',
              WebkitLineClamp: lines,
              overflow: 'hidden',
            }),
        }}
        data-test={dataTest ?? 'truncate-paragraph'}
        ref={outerRef}
      >
        <span
          data-test="truncate-span"
          ref={innerRef}
          title={innerRef.current?.textContent ?? ''}
        >
          {children}
        </span>
      </p>
      {canExpand && (
        <button
          css={theme => ({
            animation: `${theme.keyframes.fadeIn} 300ms ease forwards`,
            backgroundColor: theme.colors.transparent.primary,
            border: 0,
            color:
              shouldExpandColor === 'dark' ?
                theme.colors.black.dark
              : theme.colors.white.primary,
            cursor: 'pointer',
            fontSize: theme.fonts.size[14],
            fontWeight: theme.fonts.weight.bold,
            margin: 0,
            opacity: 0,
            padding: 0,
          })}
          data-test="truncate-button"
          onClick={toggle}
          type="button"
        >
          {expanded ? translate('Show Less') : translate('Show More')}
        </button>
      )}
    </>
  );
}

export default Truncate;
