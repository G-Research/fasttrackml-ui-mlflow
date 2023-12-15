/**
 * NOTE: this code file was automatically migrated to TypeScript using ts-migrate and
 * may contain multiple `any` type annotations and `@ts-expect-error` directives.
 * If possible, please improve types while making changes to this file. If the type
 * annotations are already looking good, please remove this comment.
 */

import React from 'react';
import { Table } from 'antd';
import { LogModelWithSignatureUrl } from '../../common/constants';
import { gray800 } from '../../common/styles/color';
import { spacingMedium } from '../../common/styles/spacing';
import { MODEL_SCHEMA_TENSOR_TYPE } from '../constants';
import { FormattedMessage, type IntlShape, injectIntl } from 'react-intl';
import { Interpolation, Theme } from '@emotion/react';
import { DesignSystemHocProps, WithDesignSystemThemeHoc } from '@databricks/design-system';

const { Column } = Table;

type Props = DesignSystemHocProps & {
  schema?: any;
  defaultExpandAllRows?: boolean;
  intl: IntlShape;
};

export class SchemaTableImpl extends React.PureComponent<Props> {
  renderSchemaTable = (schemaData: any, schemaType: any) => {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: '50%',
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        width: '50%',
      },
    ];

    return (
      <Table
        className='inner-table'
        size='middle'
        showHeader={false}
        pagination={false}
        locale={{ emptyText: `No schema ${schemaType}.` }}
        dataSource={this.getSchemaRowData(schemaData)}
        columns={columns}
        scroll={{ y: 240 }}
      />
    );
  };

  getSchemaTypeRepr = (schemaTypeSpec: any) => {
    let { type } = schemaTypeSpec;
    if (schemaTypeSpec.type === MODEL_SCHEMA_TENSOR_TYPE) {
      type = `Tensor (dtype: ${schemaTypeSpec['tensor-spec'].dtype}, shape: [${schemaTypeSpec['tensor-spec'].shape}])`;
    }

    // If the "optional" property is present and true, wrap the type around an "Optional[]"
    if (schemaTypeSpec.optional) {
      type = `Optional[${type}]`;
    }
    return type;
  };

  getSchemaRowData = (schemaData: any) => {
    const rowData: any = [];
    schemaData.forEach((row: any, index: any) => {
      rowData[index] = {
        key: index,
        name: row.name ? row.name : '-',
        type: row.type ? this.getSchemaTypeRepr(row) : '-',
      };
    });
    return rowData;
  };

  renderSectionHeader = (text: any) => {
    return <strong className='primary-text'>{text}</strong>;
  };

  render() {
    const { schema } = this.props;
    const hasSchema = schema.inputs.length || schema.outputs.length;
    const sectionHeaders = hasSchema
      ? [
          {
            key: '1',
            name: this.props.intl.formatMessage(
              {
                defaultMessage: 'Inputs ({numInputs})',
                description: 'Input section header for schema table in model version page',
              },
              {
                numInputs: schema.inputs.length,
              },
            ),
            type: '',
            table: this.renderSchemaTable(schema.inputs, 'inputs'),
          },
          {
            key: '2',
            name: this.props.intl.formatMessage(
              {
                defaultMessage: 'Outputs ({numOutputs})',
                description: 'Input section header for schema table in model version page',
              },
              {
                numOutputs: schema.outputs.length,
              },
            ),
            type: '',
            table: this.renderSchemaTable(schema.outputs, 'outputs'),
          },
        ]
      : [];

    const { theme } = this.props.designSystemThemeApi;

    return (
      // @ts-expect-error TS(2322): Type '{ [x: string]: { padding: string; width: str... Remove this comment to see the full error message
      <div css={getSchemaTableStyles(theme)}>
        <Table
          key='schema-table'
          className='outer-table'
          rowClassName='section-header-row'
          size='middle'
          pagination={false}
          defaultExpandAllRows={this.props.defaultExpandAllRows}
          expandRowByClick
          expandedRowRender={(record) => record.table}
          expandIcon={({ expanded, onExpand, record }) =>
            expanded ? (
              <span onClick={(e) => onExpand(record, e)}>
                <i className='far fa-minus-square' />
              </span>
            ) : (
              <span onClick={(e) => onExpand(record, e)}>
                <i className='far fa-plus-square' />
              </span>
            )
          }
          locale={{
            emptyText: (
              <div>
                {/* eslint-disable-next-line max-len */}
                <FormattedMessage
                  defaultMessage='No schema. See <link>MLflow docs</link> for how to include
                     input and output schema with your model.'
                  description='Text for schema table when no schema exists in the model version
                     page'
                  values={{
                    link: (chunks: any) => (
                      <a href={LogModelWithSignatureUrl} target='_blank' rel='noreferrer'>
                        {chunks}
                      </a>
                    ),
                  }}
                />
              </div>
            ),
          }}
          dataSource={sectionHeaders}
          scroll={{ x: 240 }}
        >
          <Column
            key={1}
            title={this.props.intl.formatMessage({
              defaultMessage: 'Name',
              description: 'Text for name column in schema table in model version page',
            })}
            width='50%'
            dataIndex='name'
            render={this.renderSectionHeader}
          />
          <Column
            key={2}
            title={this.props.intl.formatMessage({
              defaultMessage: 'Type',
              description: 'Text for type column in schema table in model version page',
            })}
            width='50%'
            dataIndex='type'
            render={this.renderSectionHeader}
          />
        </Table>
      </div>
    );
  }
}

export const SchemaTable = injectIntl(WithDesignSystemThemeHoc(SchemaTableImpl));

const antTable = '.ant-table-middle>.ant-table-content>.ant-table-scroll>.ant-table-body>table';
const getSchemaTableStyles = (theme: Theme) => ({
  [`${antTable}>.ant-table-thead>tr>th.ant-table-expand-icon-th`]: {
    padding: `${spacingMedium}px 0`,
    width: '32px',
  },
  [`${antTable}>.ant-table-thead>tr>th.ant-table-row-cell-break-word`]: {
    padding: `${spacingMedium}px 0`,
  },
  [`${antTable}>.ant-table-tbody>tr>td.ant-table-row-cell-break-word`]: {
    padding: `${spacingMedium}px 0`,
  },
  [`${antTable}>.ant-table-tbody>tr.section-header-row>td.ant-table-row-cell-break-word`]: {
    padding: '0',
    width: '32px',
  },
  [`${antTable}>.ant-table-tbody>tr.section-header-row>td.ant-table-row-expand-icon-cell`]: {
    padding: '0',
  },
  '.outer-table .ant-table-body': {
    // !important to override inline style of overflowX: scroll
    overflowX: 'auto !important',
    overflowY: 'hidden',
  },
  '.inner-table .ant-table-body': {
    // !important to override inline style of overflowY: scroll
    overflowY: 'auto !important',
  },
  '.inner-table': {
    maxWidth: 800,
  },
  '.outer-table': {
    maxWidth: 800,
  },
  '.section-header-row': {
    lineHeight: '32px',
    cursor: 'pointer',
  },
  '.ant-table-tbody>tr>td': {
    borderColor: theme.colors.borderDecorative,
  },
  '.ant-table-thead>tr>th': {
    backgroundColor: theme.colors.backgroundSecondary,
    color: theme.colors.textPrimary,
    borderColor: theme.colors.borderDecorative,
  },
  '.ant-table-tbody>tr.ant-table-row:hover td': {
    backgroundColor: theme.colors.backgroundSecondary,
  },
  '.ant-table-cell': {
    backgroundColor: theme.colors.backgroundPrimary,
    color: theme.colors.textPrimary,
  },
});
