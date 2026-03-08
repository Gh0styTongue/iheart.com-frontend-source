import { createContext } from 'react';

type DefaultValue = {
  active: boolean;
  update: (active: boolean) => void;
};

const RedorderPlaylistContext = createContext<DefaultValue>({
  active: false,
  update: _ => {},
});

export default RedorderPlaylistContext;
