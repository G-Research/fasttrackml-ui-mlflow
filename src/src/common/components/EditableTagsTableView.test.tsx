import React from 'react';
import { EditableTagsTableView, EditableTagsTableViewImpl } from './EditableTagsTableView';
import { mountWithIntl } from '../utils/TestUtils';
import { BrowserRouter } from 'react-router-dom';
import { DesignSystemProvider } from '@databricks/design-system';

describe('unit tests', () => {
  let wrapper;
  let instance;
  const minimalProps = {
    tags: {
      tag1: { getKey: () => 'tag1', getValue: () => 'value1' },
      tag2: { getKey: () => 'tag2', getValue: () => 'value2' },
    },
    // eslint-disable-next-line no-unused-vars
    form: { getFieldDecorator: jest.fn((opts) => (c: any) => c) },
    handleAddTag: () => {},
    handleSaveEdit: () => {},
    handleDeleteTag: () => {},
    isRequestPending: false,
  };

  const createComponentInstance = () =>
    mountWithIntl(
      <DesignSystemProvider>
        <BrowserRouter>
          <EditableTagsTableView {...minimalProps} />
        </BrowserRouter>
      </DesignSystemProvider>,
    );

  test('should render with minimal props without exploding', () => {
    wrapper = createComponentInstance();
    expect(wrapper.length).toBe(1);
  });

  test('should validate tag name properly', () => {
    wrapper = createComponentInstance();
    instance = wrapper.find(EditableTagsTableViewImpl).instance();
    const validationCallback = jest.fn();
    instance.tagNameValidator(undefined, 'tag1', validationCallback);
    expect(validationCallback).toBeCalledWith('Tag "tag1" already exists.');
  });
});
