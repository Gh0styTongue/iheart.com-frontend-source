import MediaQueries from './MediaQueries';

export default function MediaQueriesToProps({
  mediaQueryMappings,
  mergeAllMatches,
  children,
  noMatchProps,
  appMounted,
}) {
  const sortedMappings = mediaQueryMappings.sort(
    ({ width: widthA }, { width: widthB }) => (widthA <= widthB ? -1 : 1),
  );
  return appMounted ?
      <MediaQueries maxWidths={sortedMappings.map(({ width }) => width)}>
        {mediaQueryMatches => {
          let props;
          if (!mediaQueryMatches.find(match => !!match)) {
            props = noMatchProps;
          } else if (mergeAllMatches) {
            props = mediaQueryMatches.reduce((mqProps, isMatch, i) => {
              if (!mediaQueryMatches[i]) return mqProps;
              return { ...mediaQueryMatches[i].props, ...mqProps };
            }, {});
          } else {
            const propIndex = mediaQueryMatches.findIndex(match => !!match);
            props = sortedMappings[propIndex].props;
          }
          return children(props);
        }}
      </MediaQueries>
    : children(sortedMappings[0].props || noMatchProps);
}

MediaQueriesToProps.propTypes = {
  appMounted: PropTypes.bool,
  children: PropTypes.func.isRequired,
  mediaQueryMappings: PropTypes.arrayOf(
    PropTypes.shape({
      maxWidth: PropTypes.number,
      props: PropTypes.object,
    }),
  ).isRequired,
  mergeAllMatches: PropTypes.bool,
  noMatchProps: PropTypes.object,
};
/* eslint-enable react/require-default-props */
