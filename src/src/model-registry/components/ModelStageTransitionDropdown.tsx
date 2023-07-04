import React from 'react';
import { Dropdown, Menu, Modal, ChevronDownIcon } from '@databricks/design-system';
import { Stages, StageTagComponents, ActivityTypes } from '../constants';
import { DirectTransitionForm } from './DirectTransitionForm';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';

type OwnModelStageTransitionDropdownProps = {
  currentStage?: string;
  permissionLevel?: string;
  onSelect?: (...args: any[]) => any;
};

type ModelStageTransitionDropdownState = any;

type ModelStageTransitionDropdownProps = OwnModelStageTransitionDropdownProps &
  typeof ModelStageTransitionDropdown.defaultProps;

export class ModelStageTransitionDropdown extends React.Component<
  ModelStageTransitionDropdownProps,
  ModelStageTransitionDropdownState
> {
  static defaultProps = {
    currentStage: Stages.NONE,
  };

  state = {
    confirmModalVisible: false,
    confirmingActivity: null,
    handleConfirm: undefined,
  };

  transitionFormRef = React.createRef();

  handleMenuItemClick = (activity: any) => {
    const { onSelect } = this.props;
    this.setState({
      confirmModalVisible: true,
      confirmingActivity: activity,
      handleConfirm:
        onSelect &&
        (() => {
          this.setState({ confirmModalVisible: false });
          const archiveExistingVersions = Boolean(
            (this as any).transitionFormRef.current.getFieldValue('archiveExistingVersions'),
          );
          // @ts-expect-error TS(2722): Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
          this.props.onSelect(activity, archiveExistingVersions);
        }),
    });
  };

  handleConfirmModalCancel = () => {
    this.setState({ confirmModalVisible: false });
  };

  getNoneCurrentStages = (currentStage: any) => {
    const stages = Object.values(Stages);
    _.remove(stages, (s) => s === currentStage);
    return stages;
  };

  getMenu() {
    const { currentStage, onSelect } = this.props;
    const nonCurrentStages = this.getNoneCurrentStages(currentStage);
    return (
      <Menu onSelect={onSelect}>
        {nonCurrentStages.map((stage) => (
          <Menu.Item
            key={`transition-to-${stage}`}
            onClick={() =>
              this.handleMenuItemClick({
                type: ActivityTypes.APPLIED_TRANSITION,
                to_stage: stage,
              })
            }
          >
            <FormattedMessage
              defaultMessage='Transition to'
              description='Text for transitioning a model version to a different stage under
                 dropdown menu in model version page'
            />
            &nbsp;&nbsp;&nbsp;&nbsp;
            <i className='fas fa-long-arrow-right' />
            &nbsp;&nbsp;&nbsp;&nbsp;
            {StageTagComponents[stage]}
          </Menu.Item>
        ))}
      </Menu>
    );
  }

  renderConfirmModal() {
    const { confirmModalVisible, confirmingActivity, handleConfirm } = this.state;
    if (confirmingActivity) {
      const formComponent = (
        <DirectTransitionForm
          // @ts-expect-error TS(2322): Type '{ innerRef: RefObject<unknown>; toStage: any... Remove this comment to see the full error message
          innerRef={this.transitionFormRef}
          toStage={(confirmingActivity as any).to_stage}
        />
      );
      return (
        <Modal
          title={
            <FormattedMessage
              defaultMessage='Stage Transition'
              description='Title text for model version stage transitions in confirm modal'
            />
          }
          visible={confirmModalVisible}
          onOk={handleConfirm}
          onCancel={this.handleConfirmModalCancel}
          okText={
            <FormattedMessage
              defaultMessage='OK'
              description='Text for OK button on the confirmation page for stage transition
                 on the model versions page'
            />
          }
          cancelText={
            <FormattedMessage
              defaultMessage='Cancel'
              description='Text for cancel button on the confirmation page for stage
                transitions on the model versions page'
            />
          }
        >
          {renderActivityDescription(confirmingActivity)}
          {formComponent}
        </Modal>
      );
    }
    return null;
  }

  render() {
    const { currentStage } = this.props;
    return (
      <span>
        <Dropdown
          overlay={this.getMenu()}
          trigger={['click']}
          className='stage-transition-dropdown'
        >
          <span>
            {StageTagComponents[currentStage]}
            <ChevronDownIcon css={{ cursor: 'pointer', marginLeft: -4 }} />
          </span>
        </Dropdown>
        {this.renderConfirmModal()}
      </span>
    );
  }
}

export const renderActivityDescription = (activity: any) => {
  if (activity) {
    return (
      <div>
        <FormattedMessage
          defaultMessage='Transition to'
          description='Text for activity description under confirmation modal for model
             version stage transition'
        />
        &nbsp;&nbsp;&nbsp;
        <i className='fas fa-long-arrow-right' />
        &nbsp;&nbsp;&nbsp;&nbsp;
        {StageTagComponents[activity.to_stage]}
      </div>
    );
  }
  return null;
};
