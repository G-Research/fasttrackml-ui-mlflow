import React from 'react';
import { shallow } from 'enzyme';
import { RestoreRunModalImpl } from './RestoreRunModal';
import { ConfirmModal } from './ConfirmModal';

describe('RestoreRunModal', () => {
  let wrapper: any;
  let minimalProps: any;
  let mockOpenErrorModal: any;
  let mockRestoreRunApi: any;

  beforeEach(() => {
    mockOpenErrorModal = jest.fn(() => Promise.resolve({}));
    mockRestoreRunApi = jest.fn(() => Promise.resolve({}));
    minimalProps = {
      isOpen: false,
      onClose: jest.fn(() => Promise.resolve({})),
      selectedRunIds: ['run1', 'run2'],
      openErrorModal: mockOpenErrorModal,
      restoreRunApi: mockRestoreRunApi,
    };

    wrapper = shallow(<RestoreRunModalImpl {...minimalProps} />);
  });

  test('should render with minimal props without exploding', () => {
    expect(wrapper.length).toBe(1);
    expect(wrapper.find(ConfirmModal).length).toBe(1);
  });

  test('test handleRenameExperiment', (done) => {
    const promise = wrapper.find(ConfirmModal).prop('handleSubmit')();
    promise.finally(() => {
      expect(mockRestoreRunApi).toHaveBeenCalledTimes(2);
      done();
    });
  });

  test('test handleRenameExperiment errors correctly', (done) => {
    const mockFailRestoreRunApi = jest.fn(
      () =>
        new Promise((resolve, reject) => {
          window.setTimeout(() => {
            reject(
              // @ts-expect-error TS(2554): Expected 0-1 arguments, but got 2.
              new Error('Limit exceeded', {
                textJson: { error_code: 'RESOURCE_LIMIT_EXCEEDED', message: 'Limit exceeded' },
              }),
            );
          }, 1000);
        }),
    );
    const failRunApiProps = { ...minimalProps, restoreRunApi: mockFailRestoreRunApi };
    wrapper = shallow(<RestoreRunModalImpl {...failRunApiProps} />);

    const promise = wrapper.find(ConfirmModal).prop('handleSubmit')();
    promise.finally(() => {
      expect(mockFailRestoreRunApi).toHaveBeenCalledTimes(2);
      expect(mockOpenErrorModal).toHaveBeenCalledTimes(1);
      done();
    });
  });
});
