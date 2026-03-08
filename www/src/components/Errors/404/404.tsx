import H4 from 'primitives/Typography/Headings/H4';
import Image from 'components/Image';
import NavLink from 'components/NavLink';
import PageBody, { ViewName } from 'views/PageBody';
import SuggestedDestination from './primitives/SuggestedDestination';
import useMount from 'hooks/useMount';
import useTranslate from 'contexts/TranslateContext/useTranslate';
import { fourOhFour } from 'constants/assets';
import { Helmet } from 'react-helmet';
import type { State as RoutingState } from 'state/Routing/types';

type Props = {
  force404data: RoutingState['force404data'];
  setForce404data: (data: RoutingState['force404data']) => void;
  setHasHero: (hasHero: boolean) => void;
};

function PageNotFound({ force404data, setForce404data, setHasHero }: Props) {
  const translate = useTranslate();

  useMount(() => {
    setHasHero(false);
    return () => {
      // clear on off-chance user navigates to new 404
      setForce404data(null);
    };
  });

  return (
    <>
      <Helmet title="Page Not Found" />
      <PageBody dataTest={ViewName.Error404}>
        <Image alt="404" src={fourOhFour} />
        {force404data ?
          <SuggestedDestination>
            <H4 as="h2">
              {translate('Uh oh, we can’t find the page you’re looking for.')}
            </H4>
            {translate('How about this page instead: ')}
            <NavLink
              css={{ textDecoration: 'underline' }}
              to={force404data?.suggestedUrl}
            >
              {force404data?.suggestedTitle}
            </NavLink>
          </SuggestedDestination>
        : null}
      </PageBody>
    </>
  );
}

export default PageNotFound;
