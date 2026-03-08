import ImgLogo from './ImgLogo';
import LogoPrimitive from './primitives/Logo';
import SVGlogo from './SVGlogo';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getHolidayImg, getHolidayImgDark } from 'state/Theme/selectors';

const Logo = ({
  dark,
  forceDefault,
  holidayImgDark,
  holidayImg,
  ...otherProps
}) => {
  const hasHatURLs = !!holidayImg;
  const useHolidayHat = !forceDefault && hasHatURLs;
  // IHRWEB-15078 - concat className prop for emotion styled components
  const classes = (otherProps.classes || []).concat([
    otherProps?.className ?? [],
  ]);
  const { onClick } = otherProps;

  return (
    <LogoPrimitive classes={classes} onClick={onClick} title="iHeart" to="/">
      {useHolidayHat ?
        <ImgLogo url={dark ? holidayImgDark : holidayImg} />
      : <SVGlogo dark={dark} />}
    </LogoPrimitive>
  );
};

const mapStateToProps = createStructuredSelector({
  holidayImg: getHolidayImg,
  holidayImgDark: getHolidayImgDark,
});

export default connect(mapStateToProps)(Logo);
