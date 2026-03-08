import FavoritesRadioWrapper from './primitives/FavoritesRadioWrapper';
import MFRInput from './primitives/MFRInput';
import MFRWrapper from './primitives/MFRWrapper';

export default function RenameMFRInput({
  fontSize = '2.4rem',
  onChange,
  value,
  onBlur,
  onFocus,
}) {
  return (
    <MFRWrapper css={{ fontSize, position: 'relative' }}>
      <MFRInput
        autoFocus
        className={fontSize}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        value={value}
      />
      <FavoritesRadioWrapper>
        <span css={{ opacity: 0 }}>{value}</span>
        <span> Favorites Radio</span>
      </FavoritesRadioWrapper>
    </MFRWrapper>
  );
}
