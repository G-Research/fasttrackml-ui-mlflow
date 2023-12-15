import {
  Button,
  DropdownMenu,
  OverflowIcon,
  PlayIcon,
  StopIcon,
  Tooltip,
  VisibleIcon,
  useDesignSystemTheme,
} from '@databricks/design-system';
import { Link } from '../../../../common/utils/RoutingUtils';
import ExperimentRoutes from '../../../routes';
import { RunRowType } from '../../experiment-page/utils/experimentPage.row-types';
import { EvaluationRunHeaderModelIndicator } from './EvaluationRunHeaderModelIndicator';
import {
  shouldEnableExperimentDatasetTracking,
  shouldEnablePromptLab,
} from '../../../../common/utils/FeatureUtils';
import { EvaluationRunHeaderDatasetIndicator } from './EvaluationRunHeaderDatasetIndicator';
import type { RunDatasetWithTags } from '../../../types';
import { usePromptEngineeringContext } from '../contexts/PromptEngineeringContext';
import { FormattedMessage, useIntl } from 'react-intl';
import React, { useMemo } from 'react';
import { EvaluationTableHeader } from './EvaluationTableHeader';
import { useCreateNewRun } from '../../experiment-page/hooks/useCreateNewRun';
import { canEvaluateOnRun } from '../../prompt-engineering/PromptEngineering.utils';

interface EvaluationRunHeaderCellRendererProps {
  run: RunRowType;
  onHideRun: (runUuid: string) => void;
  onDuplicateRun: (run: RunRowType) => void;
  onDatasetSelected: (dataset: RunDatasetWithTags, run: RunRowType) => void;
  groupHeaderContent?: React.ReactNode;
}

/**
 * Component used as a column header for output ("run") columns
 */
export const EvaluationRunHeaderCellRenderer = ({
  run,
  onHideRun,
  onDuplicateRun,
  onDatasetSelected,
  groupHeaderContent = null,
}: EvaluationRunHeaderCellRendererProps) => {
  const { theme } = useDesignSystemTheme();
  const {
    getEvaluableRowCount,
    evaluateAllClick,
    runColumnsBeingEvaluated,
    canEvaluateInRunColumn,
  } = usePromptEngineeringContext();
  const intl = useIntl();
  const evaluableRowCount = getEvaluableRowCount(run);
  const evaluateAllButtonEnabled = evaluableRowCount > 0;

  const evaluatingAllInProgress = runColumnsBeingEvaluated.includes(run.runUuid);

  const evaluateAllTooltipContent = useMemo(() => {
    if (!evaluateAllButtonEnabled) {
      return intl.formatMessage({
        defaultMessage: 'There are no evaluable rows within this column',
        description:
          'Experiment page > artifact compare view > run column header > Disabled "Evaluate all" button tooltip when no rows are evaluable',
      });
    }
    if (evaluateAllButtonEnabled && !evaluatingAllInProgress) {
      return intl.formatMessage(
        {
          defaultMessage: 'Process {evaluableRowCount} rows without evaluation output',
          description:
            'Experiment page > artifact compare view > run column header > "Evaluate all" button tooltip',
        },
        {
          evaluableRowCount,
        },
      );
    }

    return null;
  }, [evaluableRowCount, evaluateAllButtonEnabled, evaluatingAllInProgress, intl]);

  return (
    <EvaluationTableHeader
      css={{
        justifyContent: 'flex-start',
        padding: theme.spacing.sm,
        paddingBottom: 0,
        paddingTop: theme.spacing.sm,
        flexDirection: 'column',
        gap: theme.spacing.xs / 2,
        overflow: 'hidden',
      }}
      groupHeaderContent={groupHeaderContent}
    >
      <div
        css={{
          width: '100%',
          display: 'flex',
        }}
      >
        <Link
          css={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}
          to={ExperimentRoutes.getRunPageRoute(run.experimentId, run.runUuid)}
          target='_blank'
        >
          <div
            css={{
              backgroundColor: run.color,
              width: 12,
              height: 12,
              borderRadius: 6,
            }}
          />

          {run.runName}
        </Link>
        <div css={{ flexBasis: theme.spacing.sm }} />

        <Button onClick={() => onHideRun(run.runUuid)} size='small' icon={<VisibleIcon />} />
        <div css={{ flex: 1 }} />
        {shouldEnablePromptLab() && canEvaluateInRunColumn(run) && (
          <>
            <div css={{ flexBasis: theme.spacing.sm }} />
            <Tooltip title={evaluateAllTooltipContent}>
              <Button
                disabled={!evaluateAllButtonEnabled}
                size='small'
                onClick={() => evaluateAllClick(run)}
                icon={evaluatingAllInProgress ? <StopIcon /> : <PlayIcon />}
              >
                {evaluatingAllInProgress ? (
                  <FormattedMessage
                    defaultMessage='Stop evaluating'
                    description='Experiment page > artifact compare view > run column header > "Evaluate all" button label when the column is being evaluated'
                  />
                ) : (
                  <FormattedMessage
                    defaultMessage='Evaluate all'
                    description='Experiment page > artifact compare view > run column header > "Evaluate all" button label'
                  />
                )}
              </Button>
            </Tooltip>
          </>
        )}
        <div css={{ flexBasis: theme.spacing.sm }} />
        {shouldEnablePromptLab() && canEvaluateOnRun(run) && (
          <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger asChild>
              <Button size='small' icon={<OverflowIcon />} />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item onClick={() => onDuplicateRun(run)}>
                <FormattedMessage
                  defaultMessage='Duplicate run'
                  description='Experiment page > artifact compare view > run column header > "duplicate run" button label'
                />
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        )}
      </div>

      {shouldEnablePromptLab() && canEvaluateOnRun(run) ? (
        <EvaluationRunHeaderModelIndicator run={run} />
      ) : (
        shouldEnableExperimentDatasetTracking() && (
          <EvaluationRunHeaderDatasetIndicator run={run} onDatasetSelected={onDatasetSelected} />
        )
      )}
    </EvaluationTableHeader>
  );
};
