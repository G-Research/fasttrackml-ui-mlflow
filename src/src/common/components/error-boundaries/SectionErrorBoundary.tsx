import React from 'react';
import Utils from '../../utils/Utils';

type Props = {
  showServerError?: boolean;
};

type State = any;

export class SectionErrorBoundary extends React.Component<Props, State> {
  state = { error: null };

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({ error });
    console.error(error, errorInfo);
  }

  renderErrorMessage(error: any) {
    return this.props.showServerError ? <div>Error message: {error.message}</div> : '';
  }

  render() {
    const { children } = this.props;
    const { error } = this.state;
    if (error) {
      return (
        <div>
          <p>
            <i className='fa fa-exclamation-triangle icon-fail' css={classNames.wrapper} />
            <span> Something went wrong with this section. </span>
            <span>If this error persists, please report an issue </span>
            {/* Reported during ESLint upgrade */}
            {/* eslint-disable-next-line react/jsx-no-target-blank */}
            <a href={Utils.getSupportPageUrl()} target='_blank'>
              here
            </a>
            .{this.renderErrorMessage(error)}
          </p>
        </div>
      );
    }

    return children;
  }
}

const classNames = {
  wrapper: {
    marginLeft: -2, // to align the failure icon with the collapsable section caret toggle
  },
};
