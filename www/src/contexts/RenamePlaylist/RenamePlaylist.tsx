import RenamePlaylistContext from './RenamePlaylistContext';
import { Component, ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  active: boolean;
};

class RenamePlaylist extends Component<Props, State> {
  state = {
    active: false,
  };

  update = (active: boolean): void => this.setState({ active });

  render() {
    return (
      <RenamePlaylistContext.Provider
        value={{
          active: this.state.active,
          update: this.update,
        }}
      >
        {this.props.children}
      </RenamePlaylistContext.Provider>
    );
  }
}

export default RenamePlaylist;
