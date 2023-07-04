import React, { Component } from 'react';
import './RequestStateWrapper.css';
import { connect } from 'react-redux';
import { getApis } from '../../experiment-tracking/reducers/Reducers';
import { Spinner } from './Spinner';
import { ErrorCodes } from '../constants';

export const DEFAULT_ERROR_MESSAGE = 'A request error occurred.';

type OwnRequestStateWrapperProps = {
  customSpinner?: React.ReactNode;
  shouldOptimisticallyRender?: boolean;
  requests: any[];
  requestIdsWith404sToIgnore?: string[];
  description?: any; // TODO: PropTypes.oneOf(Object.values(LoadingDescription))
};

type RequestStateWrapperState = any;

type RequestStateWrapperProps = OwnRequestStateWrapperProps &
  typeof RequestStateWrapper.defaultProps;

export class RequestStateWrapper extends Component<
  RequestStateWrapperProps,
  RequestStateWrapperState
> {
  static defaultProps = {
    requests: [],
    requestIdsWith404sToIgnore: [],
    shouldOptimisticallyRender: false,
  };

  state = {
    shouldRender: false,
    shouldRenderError: false,
  };

  static getErrorRequests(requests: any, requestIdsWith404sToIgnore: any) {
    return requests.filter((r: any) => {
      if (r.error !== undefined) {
        return !(
          requestIdsWith404sToIgnore &&
          requestIdsWith404sToIgnore.includes(r.id) &&
          r.error.getErrorCode() === ErrorCodes.RESOURCE_DOES_NOT_EXIST
        );
      }
      return false;
    });
  }

  static getDerivedStateFromProps(nextProps: any) {
    const shouldRender = nextProps.requests.length
      ? nextProps.requests.every((r: any) => r && r.active === false)
      : false;

    const requestErrors = RequestStateWrapper.getErrorRequests(
      nextProps.requests,
      nextProps.requestIdsWith404sToIgnore,
    );

    return {
      shouldRender,
      shouldRenderError: requestErrors.length > 0,
      requestErrors,
    };
  }

  getRenderedContent() {
    const { children, requests, customSpinner } = this.props;
    // @ts-expect-error TS(2339): Property 'requestErrors' does not exist on type '{... Remove this comment to see the full error message
    const { shouldRender, shouldRenderError, requestErrors } = this.state;

    if (typeof children === 'function') {
      return children(!shouldRender, shouldRenderError, requests);
    } else if (shouldRender || shouldRenderError || this.props.shouldOptimisticallyRender) {
      if (shouldRenderError) {
        triggerError(requestErrors);
      }

      return children;
    }

    return customSpinner || <Spinner />;
  }

  render() {
    return this.getRenderedContent();
  }
}

export const triggerError = (requests: any) => {
  // This triggers the OOPS error boundary.
  console.error('ERROR', requests);
  throw Error(`${DEFAULT_ERROR_MESSAGE}: ${requests.error}`);
};

// @ts-expect-error TS(7006): Parameter 'state' implicitly has an 'any' type.
const mapStateToProps = (state, ownProps) => ({
  requests: getApis(ownProps.requestIds, state),
});

export default connect(mapStateToProps)(RequestStateWrapper);
