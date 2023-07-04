import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  Button,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
  Tooltip,
  Typography,
  useDesignSystemTheme,
} from '@databricks/design-system';
import { getModelVersionPageRoute } from '../../routes';
import { KeyValueEntity } from '../../../experiment-tracking/types';
import { MLFLOW_INTERNAL_PREFIX } from '../../../common/utils/TagUtils';

const EmptyCell = () => <>&mdash;</>;

export const ModelListTagsCell = ({ tags }: { tags: KeyValueEntity[] }) => {
  const tagsToShowInitially = 3;
  const { theme } = useDesignSystemTheme();
  const [showMore, setShowMore] = useState(false);

  const validTags = tags?.filter((tag) => !tag.key.startsWith(MLFLOW_INTERNAL_PREFIX));

  const tagsToDisplay = validTags?.slice(0, showMore ? undefined : tagsToShowInitially);

  if (!validTags?.length) {
    return <EmptyCell />;
  }

  const noValue = (
    <em>
      <FormattedMessage
        description='Models table > tags column > no value'
        defaultMessage='(empty)'
      />
    </em>
  );

  return (
    <div>
      {tagsToDisplay.map((tag) => (
        <Tooltip
          key={tag.key}
          title={
            <>
              {tag.key}: {tag.value || noValue}
            </>
          }
          placement='left'
        >
          <div key={tag.key} css={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <Typography.Text bold>{tag.key}</Typography.Text>: {tag.value || noValue}
          </div>
        </Tooltip>
      ))}
      {tags.length > tagsToShowInitially && (
        <Button
          css={{ marginTop: theme.spacing.sm }}
          size='small'
          onClick={() => setShowMore(!showMore)}
          icon={showMore ? <ChevronDoubleUpIcon /> : <ChevronDoubleDownIcon />}
        >
          {showMore ? (
            <FormattedMessage
              defaultMessage='Show less'
              description='Models table > tags column > show less toggle button'
            />
          ) : (
            <FormattedMessage
              defaultMessage='{value} more'
              description='Models table > tags column > show more toggle button'
              values={{ value: validTags.length - tagsToShowInitially }}
            />
          )}
        </Button>
      )}
    </div>
  );
};

/**
 * Renders model version with the link in the models table
 */
export const ModelListVersionLinkCell = ({
  versionNumber,
  name,
}: {
  versionNumber?: string;
  name: string;
}) => {
  if (!versionNumber) {
    return <EmptyCell />;
  }
  return (
    <FormattedMessage
      defaultMessage='<link>Version {versionNumber}</link>'
      description='Row entry for version columns in the registered model page'
      values={{
        versionNumber,
        link: (text: any) => <Link to={getModelVersionPageRoute(name, versionNumber)}>{text}</Link>,
      }}
    />
  );
};
