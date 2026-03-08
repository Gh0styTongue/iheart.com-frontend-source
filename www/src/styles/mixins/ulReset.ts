type UlReset = {
  display: string;
  listStyle: string;
  margin: string;
  padding: string;
};

const ulReset: Readonly<UlReset> = {
  display: 'inline-block',
  listStyle: 'none',
  margin: '0',
  padding: '0',
};

export default ulReset;
