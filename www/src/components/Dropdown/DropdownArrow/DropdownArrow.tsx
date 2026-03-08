import Arrow from '../primitives/Arrow';
import ShouldShow from 'components/ShouldShow';
import { v4 as uuid } from 'uuid';

type Props = {
  customId?: string;
  pointUp?: boolean;
};

function DropdownArrow({ pointUp = false, customId = '' }: Props) {
  const blurId = customId || uuid();

  return (
    <Arrow pointUp={pointUp}>
      <svg viewBox="0 0 20 10">
        <filter id={blurId}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>

        <ShouldShow shouldShow={pointUp}>
          <g>
            <path
              filter={`url(#${blurId})`}
              opacity="0.2"
              points="M0,20 L10,10 L20,20"
              stroke="black"
            />
            <polygon fill="white" points="0,10 10,0 20,10" />
          </g>
        </ShouldShow>

        <ShouldShow shouldShow={!pointUp}>
          <g>
            <path
              d="M0,0 L10,10 L20,0"
              filter={`url(#${blurId})`}
              opacity="0.2"
              stroke="black"
            />
            <polygon fill="white" points="0,0 10,10, 20,0" />
          </g>
        </ShouldShow>
      </svg>
    </Arrow>
  );
}

export default DropdownArrow;
