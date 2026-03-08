import { createContext } from 'react';

type DefaultValue = {
  active: boolean;
  update: (active: boolean) => void;
};

const RenamePlaylistContext = createContext<DefaultValue>({
  active: false,
  update: _ => {},
});

export default RenamePlaylistContext;
