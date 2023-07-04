import React, { Component } from 'react';
// @ts-expect-error TS(7016): Could not find a declaration file for module 'html... Remove this comment to see the full error message
import { AllHtmlEntities } from 'html-entities';
import { getParams, getRunInfo } from '../reducers/Reducers';
import { connect } from 'react-redux';
import { Select, Spacer } from '@databricks/design-system';
import './CompareRunView.css';
import { RunInfo } from '../sdk/MlflowMessages';
import Utils from '../../common/utils/Utils';
import { getLatestMetrics } from '../reducers/MetricReducer';
import CompareRunUtil from './CompareRunUtil';
import { FormattedMessage } from 'react-intl';
import { LazyPlot } from './LazyPlot';
import { CompareRunPlotContainer } from './CompareRunPlotContainer';

const { Option, OptGroup } = Select;

type CompareRunScatterImplProps = {
  runUuids: string[];
  runInfos: any[]; // TODO: PropTypes.instanceOf(RunInfo)
  metricLists: any[][];
  paramLists: any[][];
  runDisplayNames: string[];
};

type CompareRunScatterImplState = any;

export class CompareRunScatterImpl extends Component<
  CompareRunScatterImplProps,
  CompareRunScatterImplState
> {
  // Size limits for displaying keys and values in our plot axes and tooltips
  static MAX_PLOT_KEY_LENGTH = 40;
  static MAX_PLOT_VALUE_LENGTH = 60;

  entities: any;
  metricKeys: any;
  paramKeys: any;

  constructor(props: CompareRunScatterImplProps) {
    super(props);

    this.entities = new AllHtmlEntities();

    this.metricKeys = CompareRunUtil.getKeys(this.props.metricLists, false);
    this.paramKeys = CompareRunUtil.getKeys(this.props.paramLists, false);

    if (this.paramKeys.length + this.metricKeys.length < 2) {
      this.state = { disabled: true };
    } else {
      this.state = {
        disabled: false,
        x:
          this.paramKeys.length > 0
            ? {
                key: this.paramKeys[0],
                isMetric: false,
              }
            : {
                key: this.metricKeys[1],
                isMetric: true,
              },
        y:
          this.metricKeys.length > 0
            ? {
                key: this.metricKeys[0],
                isMetric: true,
              }
            : {
                key: this.paramKeys[1],
                isMetric: false,
              },
      };
    }
  }

  /**
   * Get the value of the metric/param described by {key, isMetric}, in run i
   */
  getValue(i: any, { key, isMetric }: any) {
    const value = CompareRunUtil.findInList(
      (isMetric ? this.props.metricLists : this.props.paramLists)[i],
      key,
    );
    return value === undefined ? value : (value as any).value;
  }

  /**
   * Encode HTML entities in a string (since Plotly's tooltips take HTML)
   */
  encodeHtml(str: any) {
    return this.entities.encode(str);
  }

  render() {
    // @ts-expect-error TS(4111): Property 'disabled' comes from an index signature,... Remove this comment to see the full error message
    if (this.state.disabled) {
      return <div />;
    }

    const keyLength = CompareRunScatterImpl.MAX_PLOT_KEY_LENGTH;

    const xs: any = [];
    const ys: any = [];
    const tooltips: any = [];

    this.props.runInfos.forEach((_, index) => {
      // @ts-expect-error TS(4111): Property 'x' comes from an index signature, so it ... Remove this comment to see the full error message
      const x = this.getValue(index, this.state.x);
      // @ts-expect-error TS(4111): Property 'y' comes from an index signature, so it ... Remove this comment to see the full error message
      const y = this.getValue(index, this.state.y);
      if (x === undefined || y === undefined) {
        return;
      }
      xs.push(x);
      ys.push(y);
      tooltips.push(this.getPlotlyTooltip(index));
    });

    return (
      <CompareRunPlotContainer
        controls={
          <>
            <div>
              <label htmlFor='x-axis-selector'>
                <FormattedMessage
                  defaultMessage='X-axis:'
                  description='Label text for x-axis in scatter plot comparison in MLflow'
                />
              </label>
              {this.renderSelect('x')}
            </div>
            <Spacer />
            <div>
              {' '}
              <label htmlFor='y-axis-selector'>
                <FormattedMessage
                  defaultMessage='Y-axis:'
                  description='Label text for y-axis in scatter plot comparison in MLflow'
                />
              </label>
              {this.renderSelect('y')}
            </div>
          </>
        }
      >
        <LazyPlot
          data={[
            {
              x: xs,
              y: ys,
              text: tooltips,
              hoverinfo: 'text',
              type: 'scattergl',
              mode: 'markers',
              marker: {
                size: 10,
                color: 'rgba(200, 50, 100, .75)',
              },
            },
          ]}
          layout={{
            margin: {
              t: 30,
            },
            hovermode: 'closest',
            xaxis: {
              title: this.encodeHtml(Utils.truncateString(this.state['x'].key, keyLength)),
            },
            yaxis: {
              title: this.encodeHtml(Utils.truncateString(this.state['y'].key, keyLength)),
            },
          }}
          css={styles.plot}
          config={{
            responsive: true,
            displaylogo: false,
            scrollZoom: true,
            modeBarButtonsToRemove: [
              'sendDataToCloud',
              'select2d',
              'lasso2d',
              'resetScale2d',
              'hoverClosestCartesian',
              'hoverCompareCartesian',
            ],
          }}
          useResizeHandler
        />
      </CompareRunPlotContainer>
    );
  }

  renderSelect(axis: any) {
    return (
      <div>
        <Select
          css={styles.select}
          id={axis + '-axis-selector'}
          aria-label={`${axis} axis`}
          onChange={(value) => {
            const [prefix, ...keyParts] = value.split('-');
            const key = keyParts.join('-');
            const isMetric = prefix === 'metric';
            this.setState({ [axis]: { isMetric, key } });
          }}
          value={(this.state[axis].isMetric ? 'metric-' : 'param-') + this.state[axis].key}
        >
          <OptGroup label='Parameter'>
            {this.paramKeys.map((p: any) => (
              <Option key={'param-' + p} value={'param-' + p}>
                {p}
              </Option>
            ))}
          </OptGroup>
          <OptGroup label='Metric'>
            {this.metricKeys.map((m: any) => (
              <Option key={'metric-' + m} value={'metric-' + m}>
                {m}
              </Option>
            ))}
          </OptGroup>
        </Select>
      </div>
    );
  }

  getPlotlyTooltip(index: any) {
    const keyLength = CompareRunScatterImpl.MAX_PLOT_KEY_LENGTH;
    const valueLength = CompareRunScatterImpl.MAX_PLOT_VALUE_LENGTH;
    const runName = this.props.runDisplayNames[index];
    let result = `<b>${this.encodeHtml(runName)}</b><br>`;
    const paramList = this.props.paramLists[index];
    paramList.forEach((p) => {
      result +=
        this.encodeHtml(Utils.truncateString(p.key, keyLength)) +
        ': ' +
        this.encodeHtml(Utils.truncateString(p.value, valueLength)) +
        '<br>';
    });
    const metricList = this.props.metricLists[index];
    if (metricList.length > 0) {
      result += paramList.length > 0 ? '<br>' : '';
      metricList.forEach((m) => {
        result +=
          this.encodeHtml(Utils.truncateString(m.key, keyLength)) +
          ': ' +
          Utils.formatMetric(m.value) +
          '<br>';
      });
    }
    return result;
  }
}

const styles = {
  select: {
    width: '100%',
  },
  plot: {
    width: '100%',
  },
};

const mapStateToProps = (state: any, ownProps: any) => {
  const runInfos: any = [];
  const metricLists: any = [];
  const paramLists: any = [];
  const { runUuids } = ownProps;
  runUuids.forEach((runUuid: any) => {
    runInfos.push(getRunInfo(runUuid, state));
    metricLists.push(Object.values(getLatestMetrics(runUuid, state)));
    paramLists.push(Object.values(getParams(runUuid, state)));
  });
  return { runInfos, metricLists, paramLists };
};

export const CompareRunScatter = connect(mapStateToProps)(CompareRunScatterImpl);
