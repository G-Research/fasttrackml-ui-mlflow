import React from 'react';
import { ModelListView, ModelListViewImpl } from './ModelListView';
import { mockModelVersionDetailed, mockRegisteredModelDetailed } from '../test-utils';
import { ModelVersionStatus, Stages } from '../constants';
import { BrowserRouter } from 'react-router-dom';
import Utils from '../../common/utils/Utils';
import { Table } from 'antd';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { Provider } from 'react-redux';
import { mountWithIntl } from '../../common/utils/TestUtils';

const mockStore = configureStore([thunk, promiseMiddleware()]);

const ANTD_TABLE_PLACEHOLDER_CLS = 'tr.ant-table-placeholder';

describe('ModelListView', () => {
  let wrapper;
  let instance;
  let minimalProps: any;
  let minimalStore: any;
  let onSearchSpy;
  beforeEach(() => {
    onSearchSpy = jest.fn();
    minimalProps = {
      models: [],
      searchInput: '',
      orderByKey: 'name',
      orderByAsc: true,
      currentPage: 1,
      nextPageToken: null,
      selectedStatusFilter: '',
      selectedOwnerFilter: '',
      onSearch: onSearchSpy,
      onClear: jest.fn(),
      onClickNext: jest.fn(),
      onClickPrev: jest.fn(),
      onClickSortableColumn: jest.fn(),
      onSetMaxResult: jest.fn(),
      getMaxResultValue: jest.fn().mockReturnValue(10),
      onSearchInputChange: jest.fn(),
      onStatusFilterChange: jest.fn(),
      onOwnerFilterChange: jest.fn(),
    };
    minimalStore = mockStore({});
  });
  function setupModelListViewWithIntl(propsParam: any) {
    const props = propsParam || minimalProps;
    return mountWithIntl(
      <Provider store={minimalStore}>
        <BrowserRouter>
          <ModelListView {...props} />
        </BrowserRouter>
      </Provider>,
    );
  }
  test('should render with minimal props without exploding', () => {
    // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
    wrapper = setupModelListViewWithIntl();
    expect(wrapper.length).toBe(1);
  });
  test('should not display onBoarding helper if disabled', () => {
    // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
    wrapper = setupModelListViewWithIntl();
    wrapper.find(ModelListViewImpl).setState({
      showOnboardingHelper: false,
    });
    expect(wrapper.find("[data-testid='showOnboardingHelper']").length).toBe(0);
  });
  test('should render correct information if table is empty', () => {
    // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
    wrapper = setupModelListViewWithIntl();
    expect(wrapper.find(ANTD_TABLE_PLACEHOLDER_CLS).text()).toBe(
      'No models yet. Create a model to get started.',
    );
    wrapper.setProps({
      children: (
        <BrowserRouter>
          <ModelListView {...{ ...minimalProps, searchInput: 'xyz' }} />
        </BrowserRouter>
      ),
    });
    expect(wrapper.find(ANTD_TABLE_PLACEHOLDER_CLS).text()).toBe('No models found.');
    wrapper.find(ModelListViewImpl).setState({ lastNavigationActionWasClickPrev: true });
    expect(wrapper.find(ANTD_TABLE_PLACEHOLDER_CLS).text()).toBe(
      'No models found for the page. ' +
        'Please refresh the page as the underlying data may have changed significantly.',
    );
  });
  test('should render latest version correctly', () => {
    const models = [
      mockRegisteredModelDetailed('Model A', [
        // @ts-expect-error TS(2322): Type '{ name: any; creation_timestamp: any; last_u... Remove this comment to see the full error message
        mockModelVersionDetailed('Model A', 1, Stages.PRODUCTION, ModelVersionStatus.READY),
        // @ts-expect-error TS(2322): Type '{ name: any; creation_timestamp: any; last_u... Remove this comment to see the full error message
        mockModelVersionDetailed('Model A', 2, Stages.STAGING, ModelVersionStatus.READY),
        // @ts-expect-error TS(2322): Type '{ name: any; creation_timestamp: any; last_u... Remove this comment to see the full error message
        mockModelVersionDetailed('Model A', 3, Stages.NONE, ModelVersionStatus.READY),
      ]),
    ];
    const props = { ...minimalProps, models };
    wrapper = setupModelListViewWithIntl(props);
    expect(wrapper.find('td.latest-version').text()).toBe('Version 3');
    expect(wrapper.find('td.latest-staging').text()).toBe('Version 2');
    expect(wrapper.find('td.latest-production').text()).toBe('Version 1');
  });
  test('should render `_` when there is no version to display for the cell', () => {
    const models = [
      mockRegisteredModelDetailed('Model A', [
        // @ts-expect-error TS(2322): Type '{ name: any; creation_timestamp: any; last_u... Remove this comment to see the full error message
        mockModelVersionDetailed('Model A', 1, Stages.NONE, ModelVersionStatus.READY),
      ]),
    ];
    const props = { ...minimalProps, models };
    wrapper = setupModelListViewWithIntl(props);
    expect(wrapper.find('td.latest-version').text()).toBe('Version 1');
    expect(wrapper.find('td.latest-staging').text()).toBe('_');
    expect(wrapper.find('td.latest-production').text()).toBe('_');
  });
  test('should render tags correctly', () => {
    const models = [
      mockRegisteredModelDetailed(
        'Model A',
        [],
        [
          // @ts-expect-error TS(2322): Type 'string' is not assignable to type 'never'.
          { key: 'key', value: 'value' },
          // @ts-expect-error TS(2322): Type 'string' is not assignable to type 'never'.
          { key: 'key2', value: 'value2' },
          // @ts-expect-error TS(2322): Type 'string' is not assignable to type 'never'.
          { key: 'key3', value: 'value3' },
          // @ts-expect-error TS(2322): Type 'string' is not assignable to type 'never'.
          { key: 'key4', value: 'value4' },
        ],
      ),
    ];
    const props = { ...minimalProps, models };
    wrapper = setupModelListViewWithIntl(props);
    expect(wrapper.find('td.table-tag-container').text()).toContain('key:value');
    expect(wrapper.find('td.table-tag-container').text()).toContain('key2:value2');
    expect(wrapper.find('td.table-tag-container').text()).toContain('key3:value3');
    expect(wrapper.find('td.table-tag-container').text()).toContain('key4:value4');
  });
  test('tags cell renders multiple tags and collapses with more than 4 tags', () => {
    const models = [
      mockRegisteredModelDetailed(
        'Model A',
        [],
        [
          // @ts-expect-error TS(2322): Type 'string' is not assignable to type 'never'.
          { key: 'key', value: 'value' },
          // @ts-expect-error TS(2322): Type 'string' is not assignable to type 'never'.
          { key: 'key2', value: 'value2' },
          // @ts-expect-error TS(2322): Type 'string' is not assignable to type 'never'.
          { key: 'key3', value: 'value3' },
          // @ts-expect-error TS(2322): Type 'string' is not assignable to type 'never'.
          { key: 'key4', value: 'value4' },
          // @ts-expect-error TS(2322): Type 'string' is not assignable to type 'never'.
          { key: 'key5', value: 'value5' },
        ],
      ),
    ];
    const props = { ...minimalProps, models };
    wrapper = setupModelListViewWithIntl(props);
    expect(wrapper.find('td.table-tag-container').text()).toContain('key:value');
    expect(wrapper.find('td.table-tag-container').text()).toContain('key2:value2');
    expect(wrapper.find('td.table-tag-container').text()).toContain('key3:value3');
    expect(wrapper.find('td.table-tag-container').text()).toContain('2 more');
  });
  test('should render `_` when there are no tags to display for the cell', () => {
    const models = [
      mockRegisteredModelDetailed('Model A', [
        // @ts-expect-error TS(2322): Type '{ name: any; creation_timestamp: any; last_u... Remove this comment to see the full error message
        mockModelVersionDetailed('Model A', 1, Stages.NONE, ModelVersionStatus.READY),
      ]),
    ];
    const props = { ...minimalProps, models };
    wrapper = setupModelListViewWithIntl(props);
    expect(wrapper.find('td.table-tag-container').text()).toBe('_');
  });
  const findColumn = (table: any, index: any) =>
    table.props().columns.find((elem: any) => elem.dataIndex === index);
  test('orderByKey, orderByASC props are correctly passed to the table', () => {
    const models = [
      mockRegisteredModelDetailed('Model B', [], [], 'CAN_EDIT', 3),
      mockRegisteredModelDetailed('model c', [], [], 'CAN_EDIT', 1),
      mockRegisteredModelDetailed('Model a', [], [], 'CAN_EDIT', 2),
    ];
    let props = {
      ...minimalProps,
      models,
      orderByKey: 'name',
      orderByAsc: true,
    };
    wrapper = setupModelListViewWithIntl(props);
    let table = wrapper.find(Table);
    // prop values look legit
    expect(findColumn(table, 'name').sortOrder).toBe('ascend');
    expect(findColumn(table, 'last_updated_timestamp').sortOrder).toBe(undefined);
    // the table doesn't actually sort, though, and displays exactly what's given.
    expect(wrapper.find('td.model-name').length).toBe(3);
    expect(wrapper.find('td.model-name').at(0).text()).toBe('Model B');
    expect(wrapper.find('td.model-name').at(1).text()).toBe('model c');
    expect(wrapper.find('td.model-name').at(2).text()).toBe('Model a');
    props = {
      ...minimalProps,
      models,
      orderByKey: 'timestamp',
      orderByAsc: false,
    };
    wrapper = setupModelListViewWithIntl(props);
    table = wrapper.find(Table);
    // prop values look legit
    expect(findColumn(table, 'name').sortOrder).toBe(undefined);
    expect(findColumn(table, 'last_updated_timestamp').sortOrder).toBe('descend');
    // the table doesn't actually sort, though, and displays exactly what's given.
    expect(wrapper.find('td.model-name').length).toBe(3);
    expect(wrapper.find('td.model-name').at(0).text()).toBe('Model B');
    expect(wrapper.find('td.model-name').at(1).text()).toBe('model c');
    expect(wrapper.find('td.model-name').at(2).text()).toBe('Model a');
  });
  test('lastNavigationActionWasClickPrev is set properly on actions', () => {
    // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
    wrapper = setupModelListViewWithIntl();
    instance = wrapper.find(ModelListViewImpl).instance();
    expect(instance.state.lastNavigationActionWasClickPrev).toBe(false);
    instance.handleClickPrev();
    expect(instance.state.lastNavigationActionWasClickPrev).toBe(true);
    instance.handleClickNext();
    expect(instance.state.lastNavigationActionWasClickPrev).toBe(false);
    const event = { preventDefault: () => {} };
    instance.handleSearch(event);
    expect(instance.state.lastNavigationActionWasClickPrev).toBe(false);
    instance.handleTableChange(null, null, { field: 'name', order: 'ascend' });
    expect(instance.state.lastNavigationActionWasClickPrev).toBe(false);
  });
  test('Page title is set', () => {
    const mockUpdatePageTitle = jest.fn();
    Utils.updatePageTitle = mockUpdatePageTitle;
    // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
    wrapper = setupModelListViewWithIntl();
    expect(mockUpdatePageTitle.mock.calls[0][0]).toBe('MLflow Models');
  });
  // eslint-disable-next-line
});
