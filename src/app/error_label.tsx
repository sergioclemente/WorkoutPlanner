import * as React from 'react';

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
