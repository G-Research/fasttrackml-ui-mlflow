import {
  Button,
  Checkbox,
  FullscreenExitIcon,
  FullscreenIcon,
  SidebarIcon,
} from '@databricks/design-system';
import { Theme } from '@emotion/react';
import React, { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from '../../../../../common/utils/RoutingUtils';
import { Tooltip } from '@databricks/design-system';
import { COLUMN_SORT_BY_ASC, LIFECYCLE_FILTER, SORT_DELIMITER_SYMBOL } from '../../../../constants';
import Routes from '../../../../routes';
import { UpdateExperimentSearchFacetsFn, UpdateExperimentViewStateFn } from '../../../../types';
import { SearchExperimentRunsFacetsState } from '../../models/SearchExperimentRunsFacetsState';
import { SearchExperimentRunsViewState } from '../../models/SearchExperimentRunsViewState';
import { ExperimentRunsSelectorResult } from '../../utils/experimentRuns.selector';
import { ExperimentViewRunModals } from './ExperimentViewRunModals';
import { ExperimentViewRunsSortSelector } from './ExperimentViewRunsSortSelector';
import { ExperimentViewRunsColumnSelector } from './ExperimentViewRunsColumnSelector';
import { TAGS_TO_COLUMNS_MAP } from '../../utils/experimentPage.column-utils';
import type { ExperimentRunSortOption } from '../../hooks/useRunSortOptions';
import {
  shouldEnableArtifactBasedEvaluation,
  shouldEnableExperimentDatasetTracking,
} from '../../../../../common/utils/FeatureUtils';
import { ToggleIconButton } from '../../../../../common/components/ToggleIconButton';
import { useExperimentIds } from '../../hooks/useExperimentIds';

export type ExperimentViewRunsControlsActionsProps = {
  viewState: SearchExperimentRunsViewState;
  searchFacetsState: SearchExperimentRunsFacetsState;
  runsData: ExperimentRunsSelectorResult;
};

const CompareRunsButtonWrapper: React.FC = ({ children }) => <>{children}</>;

export const ExperimentViewRunsControlsActions = React.memo(
  ({ viewState, runsData, searchFacetsState }: ExperimentViewRunsControlsActionsProps) => {
    const { runsSelected } = viewState;
    const { runInfos } = runsData;
    const { lifecycleFilter } = searchFacetsState;

    const navigate = useNavigate();

    const [showDeleteRunModal, setShowDeleteRunModal] = useState(false);
    const [showRestoreRunModal, setShowRestoreRunModal] = useState(false);
    const [showRenameRunModal, setShowRenameRunModal] = useState(false);
    const [renamedRunName, setRenamedRunName] = useState('');

    const renameButtonClicked = useCallback(() => {
      const runsSelectedList = Object.keys(runsSelected);
      const selectedRun = runInfos.find((info) => info.run_uuid === runsSelectedList[0]);
      if (selectedRun) {
        setRenamedRunName(selectedRun.run_name);
        setShowRenameRunModal(true);
      }
    }, [runInfos, runsSelected]);

    const compareButtonClicked = useCallback(() => {
      const runsSelectedList = Object.keys(runsSelected);
      const experimentIds = runInfos
        .filter(({ run_uuid }: any) => runsSelectedList.includes(run_uuid))
        .map(({ experiment_id }: any) => experiment_id);

      navigate(Routes.getCompareRunPageRoute(runsSelectedList, [...new Set(experimentIds)].sort()));
    }, [navigate, runInfos, runsSelected]);

    const onDeleteRun = useCallback(() => setShowDeleteRunModal(true), []);
    const onRestoreRun = useCallback(() => setShowRestoreRunModal(true), []);
    const onCloseDeleteRunModal = useCallback(() => setShowDeleteRunModal(false), []);
    const onCloseRestoreRunModal = useCallback(() => setShowRestoreRunModal(false), []);
    const onCloseRenameRunModal = useCallback(() => setShowRenameRunModal(false), []);

    const selectedRunsCount = Object.values(viewState.runsSelected).filter(Boolean).length;
    const canRestoreRuns = selectedRunsCount > 0;
    const canRenameRuns = selectedRunsCount === 1;
    const canCompareRuns = selectedRunsCount > 1;
    const showActionButtons = canCompareRuns || canRenameRuns || canRestoreRuns;

    return (
      <>
        <div css={styles.controlBar}>
          <Button
            data-testid='run-rename-button'
            onClick={renameButtonClicked}
            disabled={!canRenameRuns}
          >
            <FormattedMessage
              defaultMessage='Rename'
              description='Label for the rename run button above the experiment runs table'
            />
          </Button>
          {lifecycleFilter === LIFECYCLE_FILTER.ACTIVE ? (
            <Button
              data-testid='runs-delete-button'
              disabled={!canRestoreRuns}
              onClick={onDeleteRun}
              danger
            >
              <FormattedMessage
                defaultMessage='Delete'
                // eslint-disable-next-line max-len
                description='String for the delete button to delete a particular experiment run'
              />
            </Button>
          ) : null}
          {lifecycleFilter === LIFECYCLE_FILTER.DELETED ? (
            <Button
              data-testid='runs-restore-button'
              disabled={!canRestoreRuns}
              onClick={onRestoreRun}
            >
              <FormattedMessage
                defaultMessage='Restore'
                // eslint-disable-next-line max-len
                description='String for the restore button to undo the experiments that were deleted'
              />
            </Button>
          ) : null}
          <div css={styles.buttonSeparator} />
          <CompareRunsButtonWrapper>
            <Button
              data-testid='runs-compare-button'
              disabled={!canCompareRuns}
              onClick={compareButtonClicked}
            >
              <FormattedMessage
                defaultMessage='Compare'
                // eslint-disable-next-line max-len
                description='String for the compare button to compare experiment runs to find an ideal model'
              />
            </Button>
          </CompareRunsButtonWrapper>
        </div>
        <ExperimentViewRunModals
          runsSelected={runsSelected}
          onCloseRenameRunModal={onCloseRenameRunModal}
          onCloseDeleteRunModal={onCloseDeleteRunModal}
          onCloseRestoreRunModal={onCloseRestoreRunModal}
          showDeleteRunModal={showDeleteRunModal}
          showRestoreRunModal={showRestoreRunModal}
          showRenameRunModal={showRenameRunModal}
          renamedRunName={renamedRunName}
        />
      </>
    );
  },
);

const styles = {
  buttonSeparator: (theme: Theme) => ({
    borderLeft: `1px solid ${theme.colors.border}`,
    marginLeft: theme.spacing.xs,
    marginRight: theme.spacing.xs,
    height: '100%',
  }),
  controlBar: (theme: Theme) => ({
    display: 'flex',
    gap: theme.spacing.sm,
    alignItems: 'center',
  }),
};
