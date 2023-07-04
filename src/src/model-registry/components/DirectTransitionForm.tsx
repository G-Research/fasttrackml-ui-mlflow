import { Form } from 'antd';
import { Checkbox, Tooltip } from '@databricks/design-system';
import React from 'react';
import {
  ACTIVE_STAGES,
  archiveExistingVersionToolTipText,
  Stages,
  StageTagComponents,
} from '../constants';
import { FormattedMessage, injectIntl } from 'react-intl';

type Props = {
  innerRef?: any;
  toStage?: string;
  intl: {
    formatMessage: (...args: any[]) => any;
  };
};

export class DirectTransitionFormImpl extends React.Component<Props> {
  render() {
    const { toStage, innerRef } = this.props;

    return (
      <Form ref={innerRef} className='model-version-update-form'>
        {/* prettier-ignore */}
        {toStage && ACTIVE_STAGES.includes(toStage) && (
          <Form.Item
            name='archiveExistingVersions'
            initialValue='true'
            valuePropName='checked'
            preserve={false}
          >
            <Checkbox>
              <Tooltip title={archiveExistingVersionToolTipText(toStage)}>
                <FormattedMessage
                  defaultMessage='Transition existing {currentStage} model versions to
                    {archivedStage}'
                  description='Description text for checkbox for archiving existing model versions
                    in the toStage for model version stage transition'
                  values={{
                    currentStage: StageTagComponents[toStage],
                    archivedStage: StageTagComponents[Stages.ARCHIVED],
                  }}
                />
                &nbsp;
              </Tooltip>
            </Checkbox>
          </Form.Item>
        )}
      </Form>
    );
  }
}

// @ts-expect-error TS(2769): No overload matches this call.
export const DirectTransitionForm = injectIntl(DirectTransitionFormImpl);
