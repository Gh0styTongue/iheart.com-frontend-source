export type FieldConfiguration = {
  all: {
    style: any;
  };
  card: {
    style: {
      placeholder: {
        content: {
          cvv: string;
          expiry: string;
        };
      };
    };
  };
};

export const fieldConfiguration: FieldConfiguration = {
  all: {
    style: {
      fontFamily: 'Helvetica, sans-serif',
    },
  },
  card: {
    style: {
      placeholder: {
        content: {
          cvv: 'cvv',
          expiry: 'mm/yy',
        },
      },
    },
  },
};
