import { MlflowService } from './sdk/MlflowService';
import { getUUID } from '../common/utils/ActionUtils';
import { ErrorCodes } from '../common/constants';
import { isArray } from 'lodash';
import { ViewType } from './sdk/MlflowEnums';
import { fetchEndpoint, jsonBigIntResponseParser } from '../common/utils/FetchUtils';
import { stringify as queryStringStringify } from 'qs';

export const RUNS_SEARCH_MAX_RESULTS = 100;

export const SEARCH_EXPERIMENTS_API = 'SEARCH_EXPERIMENTS_API';
export const searchExperimentsApi = (id = getUUID()) => {
  return {
    type: SEARCH_EXPERIMENTS_API,
    payload: MlflowService.searchExperiments({
      max_results: 20000,
    }),
    meta: { id: id },
  };
};

export const GET_EXPERIMENT_API = 'GET_EXPERIMENT_API';
export const getExperimentApi = (experimentId: any, id = getUUID()) => {
  return {
    type: GET_EXPERIMENT_API,
    payload: MlflowService.getExperiment({ experiment_id: experimentId }),
    meta: { id: id },
  };
};

export const CREATE_EXPERIMENT_API = 'CREATE_EXPERIMENT_API';
export const createExperimentApi = (
  experimentName: any,
  artifactPath = undefined,
  id = getUUID(),
) => {
  return (dispatch: any) => {
    const createResponse = dispatch({
      type: CREATE_EXPERIMENT_API,
      payload: MlflowService.createExperiment({
        name: experimentName,
        artifact_location: artifactPath,
      }),
      meta: { id: getUUID() },
    });
    return createResponse;
  };
};

export const DELETE_EXPERIMENT_API = 'DELETE_EXPERIMENT_API';
export const deleteExperimentApi = (experimentId: any, id = getUUID()) => {
  return (dispatch: any) => {
    const deleteResponse = dispatch({
      type: DELETE_EXPERIMENT_API,
      payload: MlflowService.deleteExperiment({ experiment_id: experimentId }),
      meta: { id: getUUID() },
    });
    return deleteResponse;
  };
};

export const UPDATE_EXPERIMENT_API = 'UPDATE_EXPERIMENT_API';
export const updateExperimentApi = (experimentId: any, newExperimentName: any, id = getUUID()) => {
  return (dispatch: any) => {
    const updateResponse = dispatch({
      type: UPDATE_EXPERIMENT_API,
      payload: MlflowService.updateExperiment({
        experiment_id: experimentId,
        new_name: newExperimentName,
      }),
      meta: { id: getUUID() },
    });
    return updateResponse;
  };
};

export const UPDATE_RUN_API = 'UPDATE_RUN_API';
export const updateRunApi = (runId: any, newName: any, id = getUUID()) => {
  return (dispatch: any) => {
    const updateResponse = dispatch({
      type: UPDATE_RUN_API,
      payload: MlflowService.updateRun({
        run_id: runId,
        run_name: newName,
      }),
      meta: { id: getUUID() },
    });
    return updateResponse;
  };
};

export const GET_RUN_API = 'GET_RUN_API';
export const getRunApi = (runId: any, id = getUUID()) => {
  return {
    type: GET_RUN_API,
    payload: MlflowService.getRun({ run_id: runId }),
    meta: { id: id },
  };
};

export const DELETE_RUN_API = 'DELETE_RUN_API';
export const deleteRunApi = (runUuid: any, id = getUUID()) => {
  return (dispatch: any) => {
    const deleteResponse = dispatch({
      type: DELETE_RUN_API,
      payload: MlflowService.deleteRun({ run_id: runUuid }),
      meta: { id: getUUID() },
    });
    return deleteResponse.then(() => dispatch(getRunApi(runUuid, id)));
  };
};
export const RESTORE_RUN_API = 'RESTORE_RUN_API';
export const restoreRunApi = (runUuid: any, id = getUUID()) => {
  return (dispatch: any) => {
    const restoreResponse = dispatch({
      type: RESTORE_RUN_API,
      payload: MlflowService.restoreRun({ run_id: runUuid }),
      meta: { id: getUUID() },
    });
    return restoreResponse.then(() => dispatch(getRunApi(runUuid, id)));
  };
};

export const SET_COMPARE_EXPERIMENTS = 'SET_COMPARE_EXPERIMENTS';
export const setCompareExperiments = ({
  comparedExperimentIds,
  hasComparedExperimentsBefore,
}: any) => {
  return {
    type: SET_COMPARE_EXPERIMENTS,
    payload: { comparedExperimentIds, hasComparedExperimentsBefore },
  };
};

export const getParentRunTagName = () => 'mlflow.parentRunId';

export const getParentRunIdsToFetch = (runs: any) => {
  const parentsToFetch = new Set();
  if (runs) {
    const currentRunIds = new Set(runs.map((run: any) => run.info.run_id));

    runs.forEach((run: any) => {
      if (run.data && run.data.tags) {
        const tagsList = run.data.tags;
        tagsList.forEach((tag: any) => {
          if (tag.key === getParentRunTagName() && !currentRunIds.has(tag.value)) {
            parentsToFetch.add(tag.value);
          }
        });
      }
    });
  }
  return Array.from(parentsToFetch);
};

// this function takes a response of runs and returns them along with their missing parents
export const fetchMissingParents = (searchRunsResponse: any) =>
  searchRunsResponse.runs && searchRunsResponse.runs.length
    ? Promise.all(
        getParentRunIdsToFetch(searchRunsResponse.runs).map((runId) =>
          MlflowService.getRun({ run_id: runId })
            .then((value) => {
              searchRunsResponse.runs.push((value as any).run);
              // Additional parent runs should be always visible
              // marked as those matching filter
              if (searchRunsResponse.runsMatchingFilter) {
                searchRunsResponse.runsMatchingFilter.push((value as any).run);
              }
            })
            .catch((error) => {
              if (error.getErrorCode() !== ErrorCodes.RESOURCE_DOES_NOT_EXIST) {
                // NB: The parent run may have been deleted, in which case attempting to fetch the
                // run fails with the `RESOURCE_DOES_NOT_EXIST` error code. Because this is
                // expected behavior, we swallow such exceptions. We re-raise all other exceptions
                // encountered when fetching parent runs because they are unexpected
                throw error;
              }
            }),
        ),
      ).then((_) => {
        return searchRunsResponse;
      })
    : searchRunsResponse;

/**
 * Creates SQL-like expression for pinned rows
 */
const createPinnedRowsExpression = (runsPinned: any) => {
  if (runsPinned.length < 1) {
    return null;
  }
  const runIdsInQuotes = runsPinned.map((runId: any) => `'${runId}'`);
  return `run_id IN (${runIdsInQuotes.join(',')})`;
};

/**
 * Main method for fetching experiment runs payload from the API
 */
export const searchRunsPayload = ({
  // Experiment IDs to fetch runs for
  experimentIds,

  // SQL-like filter
  filter,

  // Used to select either active or deleted runs
  runViewType,

  // Maximum limit of result count (not accounting pinned rows)
  maxResults,

  // Order by SQL clause
  orderBy,

  // A pagination token from the previous result
  pageToken,

  // Set to "true" if parents of children runs should be fetched as well
  shouldFetchParents,

  // Array of pinned row IDs which will be fetched with another request
  runsPinned,
}: any) => {
  // Let's start with the base request for the runs
  const promises = [
    MlflowService.searchRuns({
      experiment_ids: experimentIds,
      filter: filter,
      run_view_type: runViewType,
      max_results: maxResults || RUNS_SEARCH_MAX_RESULTS,
      order_by: orderBy,
      page_token: pageToken,
    }),
  ];

  // If we want to have pinned runs, fetch them as well
  // using another request with different filter
  if (runsPinned?.length) {
    promises.push(
      MlflowService.searchRuns({
        experiment_ids: experimentIds,
        filter: createPinnedRowsExpression(runsPinned),
        run_view_type: ViewType.ALL,
      }),
    );
  }

  // Wait for all requests to finish.
  // - `baseSearchResponse` will contain all runs that match the requested filter
  // - `pinnedSearchResponse` will contain all pinned runs, if any
  // We will merge and return an array with those two collections
  return Promise.all(promises).then(([baseSearchResponse, pinnedSearchResponse = {}]) => {
    const response = baseSearchResponse;

    // Place aside ans save runs that matched filter naturally (not the pinned ones):
    (response as any).runsMatchingFilter = (baseSearchResponse as any).runs?.slice() || [];

    // If we get pinned rows from the additional response, merge them into the base run list:
    if (isArray((pinnedSearchResponse as any).runs)) {
      if (isArray((response as any).runs)) {
        (response as any).runs.push(...(pinnedSearchResponse as any).runs);
      } else {
        (response as any).runs = (pinnedSearchResponse as any).runs.slice();
      }
    }

    // If there are any pending parents to fetch, do it before returning the response
    return shouldFetchParents ? fetchMissingParents(response) : response;
  });
};

export const SEARCH_RUNS_API = 'SEARCH_RUNS_API';
export const searchRunsApi = (params: any) => ({
  type: SEARCH_RUNS_API,
  payload: searchRunsPayload(params),
  meta: { id: params.id || getUUID() },
});

export const LOAD_MORE_RUNS_API = 'LOAD_MORE_RUNS_API';
export const loadMoreRunsApi = (params: any) => ({
  type: LOAD_MORE_RUNS_API,
  payload: searchRunsPayload(params),
  meta: { id: params.id || getUUID() },
});

// TODO: run_uuid is deprecated, use run_id instead
export const LIST_ARTIFACTS_API = 'LIST_ARTIFACTS_API';
export const listArtifactsApi = (runUuid: any, path: any, id = getUUID()) => {
  return {
    type: LIST_ARTIFACTS_API,
    payload: MlflowService.listArtifacts({
      run_uuid: runUuid,
      path: path,
    }),
    meta: { id: id, runUuid: runUuid, path: path },
  };
};

// TODO: run_uuid is deprecated, use run_id instead
export const GET_METRIC_HISTORY_API = 'GET_METRIC_HISTORY_API';
export const getMetricHistoryApi = (
  runUuid: any,
  metricKey: any,
  maxResults: any,
  pageToken: any,
  id = getUUID(),
) => {
  return {
    type: GET_METRIC_HISTORY_API,
    payload: MlflowService.getMetricHistory({
      run_uuid: runUuid,
      metric_key: decodeURIComponent(metricKey),
      max_results: maxResults,
      page_token: pageToken,
    }),
    meta: {
      id: id,
      runUuid: runUuid,
      key: metricKey,
      maxResults,
      pageToken,
    },
  };
};

export const GET_METRIC_HISTORY_API_BULK = 'GET_METRIC_HISTORY_API_BULK';
export const getMetricHistoryApiBulk = (
  runUuids: any,
  metricKey: any,
  maxResults = 25000,
  pageToken: any,
  id = getUUID(),
) => {
  // We are not using MlflowService because this endpoint requires
  // special query string preparation
  const queryParams = queryStringStringify(
    {
      run_id: runUuids,
      metric_key: decodeURIComponent(metricKey),
      max_results: maxResults,
      page_token: pageToken,
    },
    // This configures qs to stringify arrays as ?run_id=123&run_id=234
    { arrayFormat: 'repeat' },
  );
  const request = fetchEndpoint({
    relativeUrl: `ajax-api/2.0/mlflow/metrics/get-history-bulk?${queryParams}`,
    success: jsonBigIntResponseParser,
  });
  return {
    type: GET_METRIC_HISTORY_API_BULK,
    payload: request,
    meta: {
      id: id,
      runUuids: runUuids,
      key: metricKey,
      maxResults,
      pageToken,
    },
  };
};

// TODO: run_uuid is deprecated, use run_id instead
export const SET_TAG_API = 'SET_TAG_API';
export const setTagApi = (runUuid: any, tagName: any, tagValue: any, id = getUUID()) => {
  return {
    type: SET_TAG_API,
    payload: MlflowService.setTag({
      run_uuid: runUuid,
      key: tagName,
      value: tagValue,
    }),
    meta: { id: id, runUuid: runUuid, key: tagName, value: tagValue },
  };
};

// TODO: run_uuid is deprecated, use run_id instead
export const DELETE_TAG_API = 'DELETE_TAG_API';
export const deleteTagApi = (runUuid: any, tagName: any, id = getUUID()) => {
  return {
    type: DELETE_TAG_API,
    payload: MlflowService.deleteTag({
      run_id: runUuid,
      key: tagName,
    }),
    meta: { id: id, runUuid: runUuid, key: tagName },
  };
};

export const SET_EXPERIMENT_TAG_API = 'SET_EXPERIMENT_TAG_API';
export const setExperimentTagApi = (
  experimentId: any,
  tagName: any,
  tagValue: any,
  id = getUUID(),
) => {
  return {
    type: SET_EXPERIMENT_TAG_API,
    payload: MlflowService.setExperimentTag({
      experiment_id: experimentId,
      key: tagName,
      value: tagValue,
    }),
    meta: { id, experimentId, key: tagName, value: tagValue },
  };
};

export const CLOSE_ERROR_MODAL = 'CLOSE_ERROR_MODAL';
export const closeErrorModal = () => {
  return {
    type: CLOSE_ERROR_MODAL,
  };
};

export const OPEN_ERROR_MODAL = 'OPEN_ERROR_MODAL';
export const openErrorModal = (text: any) => {
  return {
    type: OPEN_ERROR_MODAL,
    text,
  };
};
