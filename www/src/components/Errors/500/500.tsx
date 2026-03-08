import Image from 'components/Image';
import PageBody, { ViewName } from 'views/PageBody';
import { fiveHundred } from 'constants/assets';
import { Helmet } from 'react-helmet';
import { PureComponent } from 'react';

type Props = {
  setHasHero: (hasHero: boolean) => void;
};

class ErrorView extends PureComponent<Props> {
  componentDidMount(): void {
    this.props.setHasHero(false);
  }

  render() {
    return (
      <>
        <Helmet title="Server Error" />
        <PageBody dataTest={ViewName.Error500}>
          <Image alt="500" src={fiveHundred} />
        </PageBody>
      </>
    );
  }
}

export default ErrorView;
