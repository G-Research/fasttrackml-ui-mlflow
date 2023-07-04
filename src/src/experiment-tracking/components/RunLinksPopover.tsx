import React from 'react';
import { Link } from 'react-router-dom';
import Routes from '../routes';
import { IconButton } from '../../common/components/IconButton';
import Utils from '../../common/utils/Utils';
import { Popover } from '@databricks/design-system';

type Props = {
  experimentId: string;
  visible: boolean;
  x: number;
  y: number;
  runItems: any[];
  handleClose: (...args: any[]) => any;
  handleKeyDown: (...args: any[]) => any;
  handleVisibleChange: (...args: any[]) => any;
};

export class RunLinksPopover extends React.Component<Props> {
  componentDidMount() {
    document.addEventListener('keydown', this.props.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.props.handleKeyDown);
  }

  renderContent = () => {
    const { experimentId, runItems } = this.props;
    return (
      <div>
        {runItems.map(({ name, runId, color, y }, index) => {
          const key = `${runId}-${index}`;
          const to = Routes.getRunPageRoute(experimentId, runId);
          return (
            <Link key={key} to={to}>
              <p style={{ color }}>
                <i className='fas fa-external-link-o' style={{ marginRight: 5 }} />
                {`${name}, ${Utils.formatMetric(y)}`}
              </p>
            </Link>
          );
        })}
      </div>
    );
  };

  renderTitle = () => {
    const { handleClose } = this.props;
    return (
      <div>
        <span>Jump to individual runs</span>
        <IconButton
          icon={<i className='fas fa-times' />}
          // @ts-expect-error TS(2322): Type '{ icon: Element; onClick: (...args: any[]) =... Remove this comment to see the full error message
          onClick={handleClose}
          style={{ float: 'right', marginLeft: '7px' }}
        />
      </div>
    );
  };

  render() {
    const { visible, x, y, handleVisibleChange } = this.props;
    return (
      <Popover
        content={this.renderContent()}
        title={this.renderTitle()}
        placement='left'
        visible={visible}
        onVisibleChange={handleVisibleChange}
      >
        <div
          style={{
            left: x,
            top: y,
            position: 'absolute',
          }}
        />
      </Popover>
    );
  }
}
