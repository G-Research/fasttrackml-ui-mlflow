import _ from 'lodash';
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router';
import { ArtifactView } from './ArtifactView';
import { Spinner } from '../../common/components/Spinner';
import { listArtifactsApi } from '../actions';
import { searchModelVersionsApi } from '../../model-registry/actions';
import { connect } from 'react-redux';
import { getArtifactRootUri } from '../reducers/Reducers';
import { MODEL_VERSION_STATUS_POLL_INTERVAL as POLL_INTERVAL } from '../../model-registry/constants';
import RequestStateWrapper from '../../common/components/RequestStateWrapper';
import Utils from '../../common/utils/Utils';
import { getUUID } from '../../common/utils/ActionUtils';
import './ArtifactPage.css';
import { getLoggedModelPathsFromTags } from '../../common/utils/TagUtils';

type ArtifactPageImplProps = {
  runUuid: string;
  initialSelectedArtifactPath?: string;
  artifactRootUri: string;
  apis: any;
  listArtifactsApi: (...args: any[]) => any;
  searchModelVersionsApi: (...args: any[]) => any;
  runTags?: any;
  modelVersions?: any[];
};

type ArtifactPageImplState = any;

export class ArtifactPageImpl extends Component<ArtifactPageImplProps, ArtifactPageImplState> {
  pollIntervalId: any;

  getFailedtoListArtifactsMsg = () => {
    return (
      <span>
        <FormattedMessage
          // eslint-disable-next-line max-len
          defaultMessage="Unable to list artifacts stored under <code>{artifactUri}</code> for the current run. Please contact your tracking server administrator to notify them of this error, which can happen when the tracking server lacks permission to list artifacts under the current run's root artifact directory."
          // eslint-disable-next-line max-len
          description='Error message when the artifact is unable to load. This message is displayed in the open source ML flow only'
          values={{ artifactUri: this.props.artifactRootUri }}
        />
      </span>
    );
  };

  state = { activeNodeIsDirectory: false, errorThrown: false };

  searchRequestId = getUUID();

  listArtifactRequestIds = [getUUID()].concat(
    this.props.initialSelectedArtifactPath
      ? this.props.initialSelectedArtifactPath.split('/').map((s) => getUUID())
      : [],
  );

  pollModelVersionsForCurrentRun = async () => {
    const { apis, runUuid } = this.props;
    const { activeNodeIsDirectory } = this.state;
    const searchRequest = apis[this.searchRequestId];
    if (activeNodeIsDirectory && !(searchRequest && searchRequest.active)) {
      try {
        // searchModelVersionsApi may be sync or async so we're not using <promise>.catch() syntax
        await this.props.searchModelVersionsApi({ run_id: runUuid }, this.searchRequestId);
      } catch (error) {
        // We're not reporting errors more than once when polling
        // in order to avoid flooding logs
        if (!this.state.errorThrown) {
          const errorMessage = `Error while fetching model version for run: ${error}`;
          Utils.logErrorAndNotifyUser(errorMessage);
          this.setState({ errorThrown: true });
        }
      }
    }
  };

  handleActiveNodeChange = (activeNodeIsDirectory: any) => {
    this.setState({ activeNodeIsDirectory });
  };

  pollArtifactsForCurrentRun = async () => {
    const { runUuid } = this.props;
    await this.props.listArtifactsApi(runUuid, undefined, this.listArtifactRequestIds[0]);
    if (this.props.initialSelectedArtifactPath) {
      const parts = this.props.initialSelectedArtifactPath.split('/');
      let pathSoFar = '';
      for (let i = 0; i < parts.length; i++) {
        pathSoFar += parts[i];
        // ML-12477: ListArtifacts API requests need to be sent and fulfilled for parent
        // directories before nested child directories, as our Reducers assume that parent
        // directories are listed before their children to construct the correct artifact tree.
        // Index i + 1 because listArtifactRequestIds[0] would have been used up by
        // root-level artifact API call above.
        // eslint-disable-next-line no-await-in-loop
        await this.props.listArtifactsApi(runUuid, pathSoFar, this.listArtifactRequestIds[i + 1]);
        pathSoFar += '/';
      }
    }
  };

  componentDidMount() {
    if (Utils.isModelRegistryEnabled()) {
      this.pollModelVersionsForCurrentRun();
      this.pollIntervalId = setInterval(this.pollModelVersionsForCurrentRun, POLL_INTERVAL);
    }
    this.pollArtifactsForCurrentRun();
  }

  componentDidUpdate(prevProps: ArtifactPageImplProps) {
    if (prevProps.runUuid !== this.props.runUuid) {
      this.setState({
        errorThrown: false,
      });
    }
  }

  componentWillUnmount() {
    if (Utils.isModelRegistryEnabled()) {
      clearInterval(this.pollIntervalId);
    }
  }

  renderArtifactView = (isLoading: any, shouldRenderError: any, requests: any) => {
    if (isLoading) {
      return <Spinner />;
    }
    if (shouldRenderError) {
      const failedReq = requests[0];
      if (failedReq && failedReq.error) {
        console.error(failedReq.error);
      }
      return (
        <div className='mlflow-artifact-error'>
          <div className='artifact-load-error-outer-container'>
            <div className='artifact-load-error-container'>
              <div>
                <div className='artifact-load-error-header'>
                  <FormattedMessage
                    defaultMessage='Loading Artifacts Failed'
                    // eslint-disable-next-line max-len
                    description='Error message rendered when loading the artifacts for the experiment fails'
                  />
                </div>
                <div className='artifact-load-error-info'>
                  <i className='far fa-times-circle artifact-load-error-icon' aria-hidden='true' />
                  {this.getFailedtoListArtifactsMsg()}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return <ArtifactView {...this.props} handleActiveNodeChange={this.handleActiveNodeChange} />;
  };

  render() {
    return (
      <RequestStateWrapper
        requestIds={this.listArtifactRequestIds}
        // eslint-disable-next-line no-trailing-spaces
      >
        {this.renderArtifactView}
      </RequestStateWrapper>
    );
  }
}

const mapStateToProps = (state: any, ownProps: any) => {
  const { runUuid, match } = ownProps;
  const { apis } = state;
  const { initialSelectedArtifactPath } = match.params;
  const artifactRootUri = getArtifactRootUri(runUuid, state);

  // Autoselect most recently created logged model
  let selectedPath = initialSelectedArtifactPath;
  if (!selectedPath) {
    const loggedModelPaths = getLoggedModelPathsFromTags(ownProps.runTags);
    if (loggedModelPaths.length > 0) {
      selectedPath = _.first(loggedModelPaths);
    }
  }
  return { artifactRootUri, apis, initialSelectedArtifactPath: selectedPath };
};

const mapDispatchToProps = {
  listArtifactsApi,
  searchModelVersionsApi,
};

export const ConnectedArtifactPage = connect(mapStateToProps, mapDispatchToProps)(ArtifactPageImpl);
export default withRouter(ConnectedArtifactPage);
