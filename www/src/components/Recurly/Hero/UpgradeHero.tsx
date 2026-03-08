import BackgroundImage from './primitives/BackgroundImage';
import HeroBackground from 'components/Hero/HeroBackground';
import HeroContainer from './primitives/HeroContainer';
import { billingHero } from 'constants/assets';
import { PureComponent } from 'react';

type Props = {
  setHasHero: (hasHero: boolean) => void;
};

export default class UpgradeHero extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    props.setHasHero(true);
  }

  componentWillUnmount() {
    this.props.setHasHero(false);
  }

  render() {
    const primaryBackground = (
      <BackgroundImage alt="Upgrade Hero" src={billingHero} />
    );

    return (
      <HeroContainer data-test="hero-container">
        <HeroBackground
          backgroundColor="#FFFFFF"
          noMask
          primaryBackground={primaryBackground}
        />
      </HeroContainer>
    );
  }
}
