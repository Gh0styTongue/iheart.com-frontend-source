type Ellipsis = Readonly<{
  overflow: string;
  textOverflow: string;
  whiteSpace: string;
}>;

const ellipsis: Ellipsis = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export default ellipsis;
