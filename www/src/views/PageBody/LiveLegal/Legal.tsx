import NavLink from 'components/NavLink';
import styled from '@emotion/styled';
import { LiveLegalLinks } from 'state/Live/types';
import { ReactElement } from 'react';

const Body = styled('div')({
  marginTop: '1.5rem',
  fontSize: '1.3rem',
  lineHeight: '1.8rem',
  marginBottom: '1.2rem',
  span: {
    marginRight: '1rem',
    marginLeft: '1rem',
  },
});

const LegalLink = styled(NavLink)({
  whiteSpace: 'nowrap',
});

export type Props = {
  legalLinks: LiveLegalLinks;
  showLegalLinks: boolean;
};
export default function Legal({ legalLinks, showLegalLinks }: Props) {
  if (!showLegalLinks) return null;

  const { facilities, assistance, contestRules, EEOPublicFile } =
    legalLinks || {};
  const { AM: amFacility, FM: fmFacility } = facilities || {};
  const links = [
    {
      href: contestRules,
      text: 'Contest Rules',
    },
    {
      href: amFacility?.public,
      text: `${amFacility?.callLetters} Public Inspection File`,
    },
    {
      href: amFacility?.political,
      text: `${amFacility?.callLetters} Political File`,
    },
    {
      href: fmFacility?.public,
      text: `${fmFacility?.callLetters} Public Inspection File`,
    },
    {
      href: fmFacility?.political,
      text: `${fmFacility?.callLetters} Political File`,
    },
    {
      href: EEOPublicFile,
      text: 'EEO Public File',
    },
    {
      href: assistance,
      text: 'Public File Assistance',
    },
  ].filter(({ href }) => Boolean(href)) as Array<{
    href: string;
    text: string;
  }>;

  return links.length ?
      <Body>
        {
          // reduce adds the | after each element, the slice cuts off the last one
          links
            .reduce<Array<ReactElement>>(
              (arr, { href, text }: { href: string; text: string }) => {
                return [
                  ...arr,
                  <LegalLink key={href} to={href}>
                    {text}
                  </LegalLink>,
                  <span key={`${href}-|`}> | </span>,
                ];
              },
              [],
            )
            .slice(0, -1)
        }
      </Body>
    : null;
}
