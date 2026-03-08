import { Component } from 'react';

export default class AppBody extends Component {
  componentDidMount() {
    this.props.appMounted();
  }

  render() {
    return <div>{this.props.children}</div>;
  }
}
