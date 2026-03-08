import DesktopLink from 'views/PageBody/primitives/DesktopLink';
import useTranslate from 'contexts/TranslateContext/useTranslate';
import { AdSlotContainer } from 'ads/index';
import { BREAKPOINTS } from 'constants/responsive';
import { MediaQueries } from 'components/MediaQueries';
import { RightRailAdDiv } from 'ads/components/AdSlotContainer';
import { SLOT_DIMENSIONS } from 'ads/constants';

function RightRailAd({
  adFree = false,
  adHref = 'http://advertise.iheart.com/',
  appMounted,
}) {
  const translate = useTranslate();
  const adsFree = appMounted && adFree;

  return (
    <>
      <div>
        <MediaQueries maxWidths={[BREAKPOINTS.LARGE]}>
          {([hideAd]) =>
            hideAd ? null : (
              <AdSlotContainer
                ccrpos="2000"
                ContainerPrimitive={RightRailAdDiv}
                dimensions={SLOT_DIMENSIONS.RIGHT_RAIL}
              />
            )
          }
        </MediaQueries>
      </div>
      {adsFree || !adHref ? null : (
        <div css={{ textAlign: 'center' }} id="under-ad-text">
          <DesktopLink
            css={theme => ({
              color: theme.colors.gray['400'],
              fontSize: theme.fonts.size.xsmall,
            })}
            dataTest="advertise-link"
            to={adHref}
          >
            {translate('Advertise With Us')}
          </DesktopLink>
        </div>
      )}
    </>
  );
}

export default RightRailAd;
