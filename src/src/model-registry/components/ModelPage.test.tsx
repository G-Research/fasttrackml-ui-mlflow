import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { mockModelVersionDetailed, mockRegisteredModelDetailed } from '../test-utils';
import { ModelVersionStatus, Stages } from '../constants';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ModelPageImpl, ModelPage } from './ModelPage';
import Utils from '../../common/utils/Utils';
import { mountWithIntl } from '../../common/utils/TestUtils';
import { modelListPageRoute } from '../routes';
import { ErrorWrapper } from '../../common/utils/ErrorWrapper';

describe('ModelPage', () => {
  let wrapper;
  let instance;
  let minimalProps: any;
  let minimalStore: any;
  const mockStore = configureStore([thunk, promiseMiddleware()]);

  beforeEach(() => {
    minimalProps = {
      match: {
        params: {
          modelName: encodeURIComponent('Model A'),
        },
      },
      history: {
        push: jest.fn(),
      },
      searchModelVersionsApi: jest.fn(() => Promise.resolve({})),
      getRegisteredModelDetailsApi: jest.fn(() => Promise.resolve({})),
    };
    const versions = [
      mockModelVersionDetailed('Model A', 1, Stages.PRODUCTION, ModelVersionStatus.READY),
    ];
    minimalStore = mockStore({
      entities: {
        modelByName: {
          // @ts-expect-error TS(2345): Argument of type '{ name: any; creation_timestamp:... Remove this comment to see the full error message
          'Model A': mockRegisteredModelDetailed('Model A', versions),
        },
        modelVersionsByModel: {
          'Model A': {
            1: mockModelVersionDetailed('Model A', 1, Stages.PRODUCTION, ModelVersionStatus.READY),
          },
        },
      },
      apis: {},
    });
  });

  test('should render with minimal props and store without exploding', () => {
    wrapper = mountWithIntl(
      <Provider store={minimalStore}>
        <BrowserRouter>
          <ModelPage {...minimalProps} />
        </BrowserRouter>
      </Provider>,
    );
    expect(wrapper.find(ModelPage).length).toBe(1);
  });

  test('should redirect to model listing page when model is deleted', () => {
    wrapper = mountWithIntl(
      <Provider store={minimalStore}>
        <BrowserRouter>
          <ModelPage {...minimalProps} />
        </BrowserRouter>
      </Provider>,
    );
    instance = wrapper.find(ModelPageImpl).instance();
    const mockError = new ErrorWrapper(
      '{ "error_code": "RESOURCE_DOES_NOT_EXIST", "message": "Foo!" }',
      404,
    );

    Utils.isBrowserTabVisible = jest.fn(() => true);
    instance.loadData = jest.fn().mockReturnValue(Promise.reject(mockError));
    return instance.pollData().then(() => {
      expect(minimalProps.history.push).toHaveBeenCalledWith(modelListPageRoute);
    });
  });
});
