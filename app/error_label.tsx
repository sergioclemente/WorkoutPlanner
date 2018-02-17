/// <reference path="../node_modules/@types/react/index.d.ts" />

import * as React from 'react';
import * as UI from '../ui';

export default class ErrorLabel extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      message: props.message || "",
    };
  }

  render() {
    return (
      <span style={{ marginLeft: "10px", color: "#a94442" }}>{this.state.message}</span>
    )
  }

  setError(msg: string) {
    this.setState({ message: msg });
  }
}
