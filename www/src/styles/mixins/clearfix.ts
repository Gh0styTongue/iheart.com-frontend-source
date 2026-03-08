type Clearfix = Readonly<{
  '&::after': {
    clear: string;
    content: string;
    display: string;
  };
}>;

const clearfix: Clearfix = {
  '&::after': {
    clear: 'both',
    content: `''`,
    display: 'table',
  },
};

export default clearfix;
