import React, { Component } from 'react';
// @ts-expect-error TS(2307): Cannot find module '../static/mlflow-spinner.png' ... Remove this comment to see the full error message
import spinner from '../static/mlflow-spinner.png';
import { keyframes } from '@emotion/react';

type Props = {
  showImmediately?: boolean;
};

export class Spinner extends Component<Props> {
  render() {
    return (
      // @ts-expect-error TS(2322): Type '(theme: Theme) => { width: number; marginTop... Remove this comment to see the full error message
      <div css={(theme) => styles.spinner(theme, this.props.showImmediately)}>
        <img alt='Page loading...' src={spinner} />
      </div>
    );
  }
}

const styles = {
  // @ts-expect-error TS(7006): Parameter 'theme' implicitly has an 'any' type.
  spinner: (theme, immediate) => ({
    width: 100,
    marginTop: 100,
    marginLeft: 'auto',
    marginRight: 'auto',

    img: {
      position: 'absolute',
      opacity: 0,
      top: '50%',
      left: '50%',
      width: theme.general.heightBase * 2,
      height: theme.general.heightBase * 2,
      marginTop: -theme.general.heightBase,
      marginLeft: -theme.general.heightBase,
      animation: `${keyframes`
          0% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            -webkit-transform: rotate(360deg);
                transform: rotate(360deg);
            }
          `} 3s linear infinite`,
      animationDelay: immediate ? 0 : '0.5s',
    },
  }),
};
