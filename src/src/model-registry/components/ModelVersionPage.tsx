import React from 'react';
import { connect } from 'react-redux';
import {
  getModelVersionApi,
  updateModelVersionApi,
  deleteModelVersionApi,
  transitionModelVersionStageApi,
  getModelVersionArtifactApi,
  parseMlModelFile,
} from '../actions';
import { getRunApi } from '../../experiment-tracking/actions';
import { getModelVersion, getModelVersionSchemas } from '../reducers';
import { ModelVersionView } from './ModelVersionView';
import { ActivityTypes, MODEL_VERSION_STATUS_POLL_INTERVAL as POLL_INTERVAL } from '../constants';
import Utils from '../../common/utils/Utils';
import { getRunInfo, getRunTags } from '../../experiment-tracking/reducers/Reducers';
import RequestStateWrapper, { triggerError } from '../../common/components/RequestStateWrapper';
import { ErrorView } from '../../common/components/ErrorView';
import { Spinner } from '../../common/components/Spinner';
import { getModelPageRoute, modelListPageRoute } from '../routes';
import { getProtoField } from '../utils';
import { getUUID } from '../../common/utils/ActionUtils';
import _ from 'lodash';
import { PageContainer } from '../../common/components/PageContainer';

type ModelVersionPageImplProps = {
  history: any;
  match: any;
  modelName: string;
  version: string;
  modelVersion?: any;
  runInfo?: any;
  runDisplayName?: string;
  getModelVersionApi: (...args: any[]) => any;
  updateModelVersionApi: (...args: any[]) => any;
  transitionModelVersionStageApi: (...args: any[]) => any;
  deleteModelVersionApi: (...args: any[]) => any;
  getRunApi: (...args: any[]) => any;
  apis: any;
  getModelVersionArtifactApi: (...args: any[]) => any;
  parseMlModelFile: (...args: any[]) => any;
  schema?: any;
  activities?: Record<string, unknown>[];
  getModelVersionActivitiesApi: (...args: any[]) => any;
  createTransitionRequestApi: (...args: any[]) => any;
  createCommentApi: (...args: any[]) => any;
  updateCommentApi: (...args: any[]) => any;
  deleteCommentApi: (...args: any[]) => any;
};

type ModelVersionPageImplState = any;

export class ModelVersionPageImpl extends React.Component<
  ModelVersionPageImplProps,
  ModelVersionPageImplState
> {
  listTransitionRequestId: any;
  pollIntervalId: any;

  initGetModelVersionDetailsRequestId = getUUID();
  getRunRequestId = getUUID();
  updateModelVersionRequestId = getUUID();
  transitionModelVersionStageRequestId = getUUID();
  getModelVersionDetailsRequestId = getUUID();
  initGetMlModelFileRequestId = getUUID();
  state = {
    criticalInitialRequestIds: [
      this.initGetModelVersionDetailsRequestId,
      this.initGetMlModelFileRequestId,
    ],
  };

  pollingRelatedRequestIds = [this.getModelVersionDetailsRequestId, this.getRunRequestId];

  hasPendingPollingRequest = () =>
    this.pollingRelatedRequestIds.every((requestId) => {
      const request = this.props.apis[requestId];
      return Boolean(request && request.active);
    });

  loadData = (isInitialLoading: any) => {
    const promises = [this.getModelVersionDetailAndRunInfo(isInitialLoading)];
    return Promise.all([promises]);
  };

  pollData = () => {
    const { modelName, version, history } = this.props;
    if (!this.hasPendingPollingRequest() && Utils.isBrowserTabVisible()) {
      // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
      return this.loadData().catch((e) => {
        if (e.getErrorCode() === 'RESOURCE_DOES_NOT_EXIST') {
          Utils.logErrorAndNotifyUser(e);
          this.props.deleteModelVersionApi(modelName, version, undefined, true);
          history.push(getModelPageRoute(modelName));
        } else {
          console.error(e);
        }
      });
    }
    return Promise.resolve();
  };

  // We need to do this because currently the ModelVersionDetailed we got does not contain
  // experimentId. We need experimentId to construct a link to the source run. This workaround can
  // be removed after the availability of experimentId.
  getModelVersionDetailAndRunInfo(isInitialLoading: any) {
    const { modelName, version } = this.props;
    return this.props
      .getModelVersionApi(
        modelName,
        version,
        isInitialLoading === true
          ? this.initGetModelVersionDetailsRequestId
          : this.getModelVersionDetailsRequestId,
      )
      .then(({ value }: any) => {
        if (value && !value[getProtoField('model_version')].run_link) {
          this.props.getRunApi(value[getProtoField('model_version')].run_id, this.getRunRequestId);
        }
      });
  }
  // We need this for getting mlModel artifact file,
  // this will be replaced with a single backend call in the future when supported
  getModelVersionMlModelFile() {
    const { modelName, version } = this.props;
    this.props
      .getModelVersionArtifactApi(modelName, version)
      .then((content: any) =>
        this.props.parseMlModelFile(
          modelName,
          version,
          content.value,
          this.initGetMlModelFileRequestId,
        ),
      )
      .catch(() => {
        // Failure of this call chain should not block the page. Here we remove
        // `initGetMlModelFileRequestId` from `criticalInitialRequestIds`
        // to unblock RequestStateWrapper from rendering its content
        this.setState((prevState: any) => ({
          criticalInitialRequestIds: _.without(
            prevState.criticalInitialRequestIds,
            this.initGetMlModelFileRequestId,
          ),
        }));
      });
  }

  handleStageTransitionDropdownSelect = (activity: any, archiveExistingVersions: any) => {
    const { modelName, version } = this.props;
    const toStage = activity.to_stage;
    if (activity.type === ActivityTypes.APPLIED_TRANSITION) {
      this.props
        .transitionModelVersionStageApi(
          modelName,
          version.toString(),
          toStage,
          archiveExistingVersions,
          this.transitionModelVersionStageRequestId,
        )
        .then(this.loadData)
        .catch(Utils.logErrorAndNotifyUser);
    }
  };

  handleEditDescription = (description: any) => {
    const { modelName, version } = this.props;
    return this.props
      .updateModelVersionApi(modelName, version, description, this.updateModelVersionRequestId)
      .then(this.loadData)
      .catch(console.error);
  };

  componentDidMount() {
    this.loadData(true).catch(console.error);
    this.pollIntervalId = setInterval(this.pollData, POLL_INTERVAL);
    this.getModelVersionMlModelFile();
  }

  // Make a new initial load if model version or name has changed
  componentDidUpdate(prevProps: ModelVersionPageImplProps) {
    if (this.props.version !== prevProps.version || this.props.modelName !== prevProps.modelName) {
      this.loadData(true).catch(console.error);
      this.getModelVersionMlModelFile();
    }
  }

  componentWillUnmount() {
    clearInterval(this.pollIntervalId);
  }

  render() {
    const { modelName, version, modelVersion, runInfo, runDisplayName, history, schema } =
      this.props;

    return (
      <PageContainer>
        <RequestStateWrapper
          requestIds={this.state.criticalInitialRequestIds}
          // eslint-disable-next-line no-trailing-spaces
        >
          {(loading: any, hasError: any, requests: any) => {
            if (hasError) {
              clearInterval(this.pollIntervalId);
              const resourceConflictError = Utils.getResourceConflictError(
                requests,
                this.state.criticalInitialRequestIds,
              );
              if (resourceConflictError) {
                return (
                  <ErrorView
                    statusCode={409}
                    subMessage={resourceConflictError.error.getMessageField()}
                    fallbackHomePageReactRoute={modelListPageRoute}
                  />
                );
              }
              if (Utils.shouldRender404(requests, this.state.criticalInitialRequestIds)) {
                return (
                  <ErrorView
                    statusCode={404}
                    subMessage={`Model ${modelName} v${version} does not exist`}
                    fallbackHomePageReactRoute={modelListPageRoute}
                  />
                );
              }
              // TODO(Zangr) Have a more generic boundary to handle all errors, not just 404.
              triggerError(requests);
            } else if (loading) {
              return <Spinner />;
            } else if (modelVersion) {
              // Null check to prevent NPE after delete operation
              return (
                <ModelVersionView
                  modelName={modelName}
                  modelVersion={modelVersion}
                  runInfo={runInfo}
                  runDisplayName={runDisplayName}
                  handleEditDescription={this.handleEditDescription}
                  deleteModelVersionApi={this.props.deleteModelVersionApi}
                  history={history}
                  handleStageTransitionDropdownSelect={this.handleStageTransitionDropdownSelect}
                  schema={schema}
                />
              );
            }
            return null;
          }}
        </RequestStateWrapper>
      </PageContainer>
    );
  }
}

const mapStateToProps = (state: any, ownProps: any) => {
  const modelName = decodeURIComponent(ownProps.match.params.modelName);
  const { version } = ownProps.match.params;
  const modelVersion = getModelVersion(state, modelName, version);
  const schema = getModelVersionSchemas(state, modelName, version);
  let runInfo = null;
  if (modelVersion && !modelVersion.run_link) {
    runInfo = getRunInfo(modelVersion && modelVersion.run_id, state);
  }
  const tags = runInfo && getRunTags(runInfo.getRunUuid(), state);
  const runDisplayName = tags && Utils.getRunDisplayName(runInfo, runInfo.getRunUuid());
  const { apis } = state;
  return {
    modelName,
    version,
    modelVersion,
    schema,
    runInfo,
    runDisplayName,
    apis,
  };
};

const mapDispatchToProps = {
  getModelVersionApi,
  updateModelVersionApi,
  transitionModelVersionStageApi,
  getModelVersionArtifactApi,
  parseMlModelFile,
  deleteModelVersionApi,
  getRunApi,
};

export const ModelVersionPage = connect(mapStateToProps, mapDispatchToProps)(ModelVersionPageImpl);
