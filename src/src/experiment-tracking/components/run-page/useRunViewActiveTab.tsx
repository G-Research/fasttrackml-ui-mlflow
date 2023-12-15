import { useParams } from '../../../common/utils/RoutingUtils';
import { RunPageTabName } from '../../constants';

/**
 * Returns the run view's active tab.
 * - Supports multi-slash artifact paths (hence '*' catch-all param)
 * - Supports both new (/artifacts/...) and previous (/artifactPath/...) routes
 */
export const useRunViewActiveTab = (): RunPageTabName => {
  const { '*': tabParam } = useParams<{ '*': string }>();
  if (tabParam === 'charts') {
    return RunPageTabName.CHARTS;
  }
  if (tabParam?.match(/^(artifactPath|artifacts)/)) {
    return RunPageTabName.ARTIFACTS;
  }

  return RunPageTabName.OVERVIEW;
};
