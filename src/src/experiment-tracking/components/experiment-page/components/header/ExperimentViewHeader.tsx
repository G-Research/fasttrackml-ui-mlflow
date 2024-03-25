import React, { useEffect, useMemo, useState } from 'react';
import { Theme } from '@emotion/react';
import { Button, NewWindowIcon } from '@databricks/design-system';
import { FormattedMessage } from 'react-intl';
import { PageHeader } from '../../../../../shared/building_blocks/PageHeader';
import { ExperimentViewCopyTitle } from './ExperimentViewCopyTitle';
import { ExperimentViewHeaderShareButton } from './ExperimentViewHeaderShareButton';
import { ExperimentEntity } from '../../../../types';
import { useExperimentPageFeedbackUrl } from '../../hooks/useExperimentPageFeedbackUrl';
import { MlflowService } from 'experiment-tracking/sdk/MlflowService';

/**
 * Header for a single experiment page. Displays title, breadcrumbs and provides
 * controls for renaming, deleting and editing permissions.
 */
export const ExperimentViewHeader = React.memo(
  ({ experiment }: { experiment: ExperimentEntity }) => {
    // eslint-disable-next-line prefer-const
    let breadcrumbs: React.ReactNode[] = [];

    /**
     * Extract the last part of the experiment name
     */
    const normalizedExperimentName = useMemo(
      () => experiment.name.split('/').pop(),
      [experiment.name],
    );

    const feedbackFormUrl = useExperimentPageFeedbackUrl();
    const [namespace, setNamespace] = useState<string>('');

    useEffect(() => {
      MlflowService.getCurrentNamespacePath().then(setNamespace);
    }, []);


    return (
      <PageHeader
        title={
          <div css={styles.headerWrapper}>
            {normalizedExperimentName} <ExperimentViewCopyTitle experiment={experiment} />{' '}
              <a href={`${window.location.origin}${namespace}/aim/experiments/${experiment.experiment_id}/overview`} target='_blank' rel='noreferrer'>
                <Button css={{ marginLeft: 16 }} type='link' size='small'>
                  <FormattedMessage
                    defaultMessage='Open in Modern UI'
                    description='Link to the corresponding experiment in the Aim UI'
                  />
                </Button>
              </a>
            {feedbackFormUrl && (
                <a href={feedbackFormUrl} target='_blank' rel='noreferrer'>
                  <Button css={{ marginLeft: 16 }} type='link' size='small'>
                    <FormattedMessage
                      defaultMessage='Provide Feedback'
                      description='Link to a survey for users to give feedback'
                    />
                  </Button>
                  <NewWindowIcon css={{ marginLeft: 4 }} />
                </a>
            )}
          </div>
        }
        breadcrumbs={breadcrumbs}
      >
          <ExperimentViewHeaderShareButton />
      </PageHeader>
    );
  },
);

const styles = {
  sendFeedbackPopoverContent: {
    display: 'flex',
    maxWidth: 250,
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
  },
  headerWrapper: (theme: Theme) => ({
    display: 'inline-flex',
    gap: theme.spacing.sm,
    alignItems: 'center',
  }),
};
