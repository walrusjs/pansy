import React from 'react';

interface ButtonProps {
  text?: string;
}

class Button extends React.Component<ButtonProps> {
  static defaultProps = {
    text: 'hello world'
  };
  render() {
    const { text } = this.props;
    return <button>{text}</button>;
  }
}

export default Button;
