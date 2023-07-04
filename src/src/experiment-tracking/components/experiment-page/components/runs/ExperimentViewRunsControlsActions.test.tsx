import { useState } from 'react';
import type { ReactWrapper } from 'enzyme';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import { applyMiddleware, compose, createStore } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import { mountWithIntl } from '../../../../../common/utils/TestUtils';
import { EXPERIMENT_RUNS_MOCK_STORE } from '../../fixtures/experiment-runs.fixtures';
import { SearchExperimentRunsFacetsState } from '../../models/SearchExperimentRunsFacetsState';
import { SearchExperimentRunsViewState } from '../../models/SearchExperimentRunsViewState';
import { experimentRunsSelector } from '../../utils/experimentRuns.selector';
import { GetExperimentRunsContextProvider } from '../../contexts/GetExperimentRunsContext';
import {
  ExperimentViewRunsControlsActions,
  ExperimentViewRunsControlsActionsProps,
} from './ExperimentViewRunsControlsActions';

jest.mock('./ExperimentViewRefreshButton', () => ({
  ExperimentViewRefreshButton: () => <div />,
}));

const MOCK_EXPERIMENT = EXPERIMENT_RUNS_MOCK_STORE.entities.experimentsById['123456789'];

const MOCK_RUNS_DATA = experimentRunsSelector(EXPERIMENT_RUNS_MOCK_STORE, {
  experiments: [MOCK_EXPERIMENT],
});

const DEFAULT_VIEW_STATE = new SearchExperimentRunsViewState();

const doMock = (additionalProps: Partial<ExperimentViewRunsControlsActionsProps> = {}) => {
  const mockUpdateSearchFacets = jest.fn();
  let currentState: any;

  const getCurrentState = () => currentState;

  const Component = () => {
    const [searchFacetsState, setSearchFacetsState] = useState<SearchExperimentRunsFacetsState>(
      new SearchExperimentRunsFacetsState(),
    );

    currentState = searchFacetsState;

    const updateSearchFacets: any = (
      updatedFacetsState: Partial<SearchExperimentRunsFacetsState>,
      forceRefresh?: boolean,
    ) => {
      mockUpdateSearchFacets(updatedFacetsState, forceRefresh);
      setSearchFacetsState((s: any) => ({ ...s, ...updatedFacetsState }));
    };

    const props: ExperimentViewRunsControlsActionsProps = {
      runsData: MOCK_RUNS_DATA,
      updateSearchFacets,
      searchFacetsState,
      viewState: DEFAULT_VIEW_STATE,
      ...additionalProps,
    };
    return (
      <Provider
        store={createStore(
          (s) => s as any,
          EXPERIMENT_RUNS_MOCK_STORE,
          compose(applyMiddleware(promiseMiddleware())),
        )}
      >
        <StaticRouter location='/'>
          <GetExperimentRunsContextProvider actions={{} as any}>
            <IntlProvider locale='en'>
              <ExperimentViewRunsControlsActions {...props} />
            </IntlProvider>
          </GetExperimentRunsContextProvider>
        </StaticRouter>
      </Provider>
    );
  };
  return {
    wrapper: mountWithIntl(<Component />),
    mockUpdateSearchFacets,
    getCurrentState,
  };
};

// @ts-expect-error TS(2709): Cannot use namespace 'ReactWrapper' as a type.
export const getActionButtons = (wrapper: ReactWrapper) => {
  const deleteButton = wrapper.find("button[data-testid='runs-delete-button']");
  const compareButton = wrapper.find("button[data-testid='runs-compare-button']");
  const renameButton = wrapper.find("button[data-testid='run-rename-button']");
  return { deleteButton, compareButton, renameButton };
};

describe('ExperimentViewRunsControlsFilters', () => {
  test('should render with given search facets model properly', () => {
    const { wrapper } = doMock();
    expect(wrapper).toBeTruthy();
  });

  test('should hide compare and delete buttons when no runs are selected', () => {
    const { wrapper } = doMock();

    const { deleteButton, compareButton, renameButton } = getActionButtons(wrapper);

    // All buttons should be hidden
    expect(deleteButton.length).toBe(0);
    expect(compareButton.length).toBe(0);
    expect(renameButton.length).toBe(0);
  });

  test('should enable delete buttons when there is single row selected', () => {
    const { wrapper } = doMock({
      viewState: {
        runsSelected: { '123': true },
        hiddenChildRunsSelected: {},
        columnSelectorVisible: false,
      },
    });

    const { deleteButton, compareButton, renameButton } = getActionButtons(wrapper);

    // All buttons should be visible
    expect(deleteButton.length).toBe(1);
    expect(compareButton.length).toBe(1);
    expect(renameButton.length).toBe(1);

    // Only compare button should be disabled
    expect(deleteButton.getDOMNode().getAttribute('disabled')).toBeNull();
    expect(compareButton.getDOMNode().getAttribute('disabled')).not.toBeNull();
    expect(renameButton.getDOMNode().getAttribute('disabled')).toBeNull();
  });

  test('should enable delete and compare buttons when there are multiple rows selected', () => {
    const { wrapper } = doMock({
      viewState: {
        runsSelected: { '123': true, '321': true },
        hiddenChildRunsSelected: {},
        columnSelectorVisible: false,
      },
    });

    const { deleteButton, compareButton, renameButton } = getActionButtons(wrapper);

    // All buttons should be visible
    expect(deleteButton.length).toBe(1);
    expect(compareButton.length).toBe(1);
    expect(renameButton.length).toBe(1);

    // Only rename button should be disabled
    expect(deleteButton.getDOMNode().getAttribute('disabled')).toBeNull();
    expect(compareButton.getDOMNode().getAttribute('disabled')).toBeNull();
    expect(renameButton.getDOMNode().getAttribute('disabled')).not.toBeNull();
  });

  test('should enable rename button when necessary', () => {
    const { wrapper } = doMock({
      viewState: {
        runsSelected: { '123': true },
        hiddenChildRunsSelected: {},
        columnSelectorVisible: false,
      },
    });

    const deleteButton = wrapper.find("button[data-testid='run-rename-button']");
    expect(deleteButton.getDOMNode().getAttribute('disabled')).toBeNull();
  });

  test('should disable rename button when necessary', () => {
    const { wrapper } = doMock({
      viewState: {
        runsSelected: { '123': true, '321': true },
        hiddenChildRunsSelected: {},
        columnSelectorVisible: false,
      },
    });

    const deleteButton = wrapper.find("button[data-testid='run-rename-button']");
    expect(deleteButton.getDOMNode().getAttribute('disabled')).not.toBeNull();
  });
});
