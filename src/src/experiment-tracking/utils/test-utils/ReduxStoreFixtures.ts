import { RunTag, Experiment, RunInfo, Metric } from '../../sdk/MlflowMessages';

export const emptyState = {
  apis: {},
  entities: {
    runInfosByUuid: {},
    experimentsById: {},
    experimentTagsByExperimentId: {},
    tagsByRunUuid: {},
    modelVersionsByRunUuid: {},
  },
};

export const addApiToState = (state: any, api: any) => {
  const oldApi = state.apis || {};
  return {
    ...state,
    apis: {
      ...oldApi,
      [api.id]: api,
    },
  };
};

export const addExperimentToState = (state: any, experiment: any) => {
  const oldExperiments = state.entities.experimentsById;
  return {
    ...state,
    entities: {
      ...state.entities,
      experimentsById: {
        ...oldExperiments,
        [experiment.experiment_id]: experiment,
      },
    },
  };
};

export const addExperimentTagsToState = (state: any, experiment_id: any, tags: any) => {
  const oldExperimentTags = state.entities.experimentTagsByExperimentId;
  const tagsArrToObject = (tagsArr: any) => {
    const tagObj = {};
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    tagsArr.forEach((tag: any) => (tagObj[tag.key] = (RunTag as any).fromJs(tag)));
    return tagObj;
  };
  return {
    ...state,
    entities: {
      ...state.entities,
      experimentTagsByExperimentId: {
        ...oldExperimentTags,
        [experiment_id]: tagsArrToObject(tags),
      },
    },
  };
};

export const createPendingApi = (id: any) => {
  return { id, active: true };
};

export const mockExperiment = (eid: any, name: any) => {
  return (Experiment as any).fromJs({ experiment_id: eid, name: name });
};

export const mockRunInfo = (
  run_id: any,
  experiment_id = undefined,
  artifact_uri = undefined,
  lifecycle_stage = undefined,
) => {
  return (RunInfo as any).fromJs({
    run_uuid: run_id,
    experiment_id: experiment_id,
    artifact_uri: artifact_uri,
    lifecycle_stage: lifecycle_stage,
  });
};

export const mockMetric = (params: any) => {
  return (Metric as any).fromJs(params);
};
