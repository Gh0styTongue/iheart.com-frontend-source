import MediaQuery from './MediaQuery';

export default function MediaQueries({ maxWidths, children }) {
  const maxWidthCallStack = maxWidths.reduce(
    (newChildren, width, index) => breakPointArray => (
      <MediaQuery
        breakPointArray={breakPointArray}
        index={index}
        maxWidth={width}
      >
        {newChildren}
      </MediaQuery>
    ),
    children,
  );

  return maxWidthCallStack();
}

MediaQueries.propTypes = {
  children: PropTypes.func.isRequired,
  maxWidths: PropTypes.arrayOf(PropTypes.number).isRequired,
};
