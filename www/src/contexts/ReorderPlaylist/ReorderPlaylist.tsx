import ReorderPlaylistContext from './ReorderPlaylistContext';
import { Component, ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  active: boolean;
};

class ReorderPlaylist extends Component<Props, State> {
  state = {
    active: false,
  };

  update = (active: boolean): void => this.setState({ active });

  render() {
    return (
      <ReorderPlaylistContext.Provider
        value={{
          active: this.state.active,
          update: this.update,
        }}
      >
        {this.props.children}
      </ReorderPlaylistContext.Provider>
    );
  }
}

export default ReorderPlaylist;
