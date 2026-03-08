import IHRimg from './primitives/IHRimg';
import LoadingBars from './primitives/LoadingBars';
import LoadingContainer from './primitives/LoadingContainer';
import LoadingElement from './primitives/LoadingElement';
import { placeholder } from 'constants/assets';

function Loader() {
  return (
    <div>
      <IHRimg>
        <img alt="Loading" src={placeholder} width="200" />
      </IHRimg>
      <LoadingContainer>
        <LoadingElement>
          <LoadingBars>
            <div />
            <div />
            <div />
            <div />
            <div />
          </LoadingBars>
        </LoadingElement>
      </LoadingContainer>
    </div>
  );
}

export default Loader;
