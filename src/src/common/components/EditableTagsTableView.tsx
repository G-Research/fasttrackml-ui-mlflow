import React, { Component } from 'react';
import Utils from '../utils/Utils';
import { Form, Input, Button, Spacer } from '@databricks/design-system';
import { EditableFormTable } from './tables/EditableFormTable';
import _ from 'lodash';
import { FormattedMessage, injectIntl } from 'react-intl';

type Props = {
  tags: any;
  handleAddTag: (...args: any[]) => any;
  handleSaveEdit: (...args: any[]) => any;
  handleDeleteTag: (...args: any[]) => any;
  isRequestPending: boolean;
  intl: {
    formatMessage: (...args: any[]) => any;
  };
  innerRef?: any;
};

export class EditableTagsTableViewImpl extends Component<Props> {
  tableColumns = [
    {
      title: this.props.intl.formatMessage({
        defaultMessage: 'Name',
        description: 'Column title for name column in editable tags table view in MLflow',
      }),
      dataIndex: 'name',
      width: 200,
    },
    {
      title: this.props.intl.formatMessage({
        defaultMessage: 'Value',
        description: 'Column title for value column in editable tags table view in MLflow',
      }),
      dataIndex: 'value',
      width: 200,
      editable: true,
    },
  ];

  getData = () =>
    _.sortBy(
      Utils.getVisibleTagValues(this.props.tags).map((values) => ({
        key: values[0],
        name: values[0],
        value: values[1],
      })),
      'name',
    );

  getTagNamesAsSet = () =>
    new Set(Utils.getVisibleTagValues(this.props.tags).map((values) => values[0]));

  tagNameValidator = (rule: any, value: any, callback: any) => {
    const tagNamesSet = this.getTagNamesAsSet();
    callback(
      tagNamesSet.has(value)
        ? this.props.intl.formatMessage(
            {
              defaultMessage: 'Tag "{value}" already exists.',
              description: 'Validation message for tags that already exist in tags table in MLflow',
            },
            {
              value: value,
            },
          )
        : undefined,
    );
  };

  render() {
    const { isRequestPending, handleSaveEdit, handleDeleteTag, handleAddTag, innerRef } =
      this.props;

    return (
      <>
        <EditableFormTable
          columns={this.tableColumns}
          data={this.getData()}
          onSaveEdit={handleSaveEdit}
          onDelete={handleDeleteTag}
        />
        <Spacer size='sm' />
        <div>
          {/* @ts-expect-error TS(2322): Type '{ children: Element[]; ref: any; layout: "in... Remove this comment to see the full error message */}
          <Form ref={innerRef} layout='inline' onFinish={handleAddTag} css={styles.form}>
            <Form.Item
              name='name'
              rules={[
                {
                  required: true,
                  message: this.props.intl.formatMessage({
                    defaultMessage: 'Name is required.',
                    description:
                      'Error message for name requirement in editable tags table view in MLflow',
                  }),
                },
                {
                  validator: this.tagNameValidator,
                },
              ]}
            >
              <Input
                aria-label='tag name'
                data-testid='tags-form-input-name'
                placeholder={this.props.intl.formatMessage({
                  defaultMessage: 'Name',
                  description:
                    'Default text for name placeholder in editable tags table form in MLflow',
                })}
              />
            </Form.Item>
            <Form.Item name='value' rules={[]}>
              <Input
                aria-label='tag value'
                data-testid='tags-form-input-value'
                placeholder={this.props.intl.formatMessage({
                  defaultMessage: 'Value',
                  description:
                    'Default text for value placeholder in editable tags table form in MLflow',
                })}
              />
            </Form.Item>
            <Form.Item>
              <Button loading={isRequestPending} htmlType='submit' data-testid='add-tag-button'>
                <FormattedMessage
                  defaultMessage='Add'
                  description='Add button text in editable tags table view in MLflow'
                />
              </Button>
            </Form.Item>
          </Form>
        </div>
      </>
    );
  }
}

const styles = {
  form: (theme: any) => ({
    '& > div': { marginRight: theme.spacing.sm },
  }),
};

// @ts-expect-error TS(2769): No overload matches this call.
export const EditableTagsTableView = injectIntl(EditableTagsTableViewImpl);
