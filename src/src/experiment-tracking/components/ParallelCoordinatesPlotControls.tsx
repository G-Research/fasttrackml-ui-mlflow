import React from 'react';
import { Button, Select } from '@databricks/design-system';
import { FormattedMessage } from 'react-intl';

type Props = {
  paramKeys: string[];
  metricKeys: string[];
  selectedParamKeys: string[];
  selectedMetricKeys: string[];
  handleParamsSelectChange: (...args: any[]) => any;
  handleMetricsSelectChange: (...args: any[]) => any;
  onClearAllSelect: (...args: any[]) => any;
};

export class ParallelCoordinatesPlotControls extends React.Component<Props> {
  render() {
    const {
      paramKeys,
      metricKeys,
      selectedParamKeys,
      selectedMetricKeys,
      handleParamsSelectChange,
      handleMetricsSelectChange,
      onClearAllSelect,
    } = this.props;
    return (
      <div css={styles.wrapper}>
        <div>
          <FormattedMessage
            defaultMessage='Parameters:'
            description='Label text for parameters in parallel coordinates plot in MLflow'
          />
        </div>
        <Select
          mode='multiple'
          css={styles.select}
          placeholder={
            <FormattedMessage
              defaultMessage='Please select parameters'
              description='Placeholder text for parameters in parallel coordinates plot in MLflow'
            />
          }
          value={selectedParamKeys}
          onChange={handleParamsSelectChange}
        >
          {paramKeys.map((key) => (
            <Select.Option value={key} key={key}>
              {key}
            </Select.Option>
          ))}
        </Select>
        <div style={{ marginTop: 20 }}>
          <FormattedMessage
            defaultMessage='Metrics:'
            description='Label text for metrics in parallel coordinates plot in MLflow'
          />
        </div>
        <Select
          mode='multiple'
          css={styles.select}
          placeholder={
            <FormattedMessage
              defaultMessage='Please select metrics'
              description='Placeholder text for metrics in parallel coordinates plot in MLflow'
            />
          }
          value={selectedMetricKeys}
          onChange={handleMetricsSelectChange}
        >
          {metricKeys.map((key) => (
            <Select.Option value={key} key={key}>
              {key}
            </Select.Option>
          ))}
        </Select>
        <div style={{ marginTop: 20 }}>
          <Button data-test-id='clear-button' onClick={onClearAllSelect}>
            <FormattedMessage
              defaultMessage='Clear All'
              description='String for the clear button to clear any selected parameters and metrics'
            />
          </Button>
        </div>
      </div>
    );
  }
}

const styles = {
  wrapper: (theme: any) => ({
    padding: `0 ${theme.spacing.xs}px`,
  }),
  select: { width: '100%' },
};
