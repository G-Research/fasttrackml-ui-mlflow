import type { ColDef, ColumnApi, IsFullWidthRowParams } from '@ag-grid-community/core';
import { Spinner } from '@databricks/design-system';
import { useEffect, useMemo, useRef } from 'react';
import { isEqual } from 'lodash';
import Utils from '../../../../common/utils/Utils';
import {
  ATTRIBUTE_COLUMN_LABELS,
  ATTRIBUTE_COLUMN_SORT_KEY,
  COLUMN_TYPES,
} from '../../../constants';
import { ColumnHeaderCell } from '../components/runs/cells/ColumnHeaderCell';
import { DateCellRenderer } from '../components/runs/cells/DateCellRenderer';
import { ExperimentNameCellRenderer } from '../components/runs/cells/ExperimentNameCellRenderer';
import { ModelsCellRenderer } from '../components/runs/cells/ModelsCellRenderer';
import { SourceCellRenderer } from '../components/runs/cells/SourceCellRenderer';
import { VersionCellRenderer } from '../components/runs/cells/VersionCellRenderer';
import type { SearchExperimentRunsFacetsState } from '../models/SearchExperimentRunsFacetsState';
import {
  EXPERIMENT_FIELD_PREFIX_METRIC,
  EXPERIMENT_FIELD_PREFIX_PARAM,
  EXPERIMENT_FIELD_PREFIX_TAG,
  getQualifiedEntityName,
} from './experimentPage.common-utils';
import { RunRowType } from './experimentPage.row-types';
import { RowActionsCellRenderer } from '../components/runs/cells/RowActionsCellRenderer';
import { RowActionsHeaderCellRenderer } from '../components/runs/cells/RowActionsHeaderCellRenderer';
import { RunNameCellRenderer } from '../components/runs/cells/RunNameCellRenderer';
import { LoadMoreRowRenderer } from '../components/runs/cells/LoadMoreRowRenderer';
import { shouldUseNextRunsComparisonUI } from '../../../../common/utils/FeatureUtils';

/**
 * Calculates width for "run name" column.
 */
const getRunNameColumnWidth = () => {
  if (shouldUseNextRunsComparisonUI()) {
    return 310;
  }
  return 260;
};

/**
 * Calculates width for "actions" column. "compactMode" should be set to true
 * for compare runs mode when checkboxes are hidden.
 */
const getActionsColumnWidth = (compactMode?: boolean) => {
  if (shouldUseNextRunsComparisonUI()) {
    // 70px when checkboxes are hidden, 104px otherwise
    return compactMode ? 70 : 104;
  }
  return 70;
};

/**
 * Creates canonical sort key name for metrics and params in form
 * of "keyType.`keyName`", e.g. "params.`paramName`"
 */
export const makeCanonicalSortKey = (keyType: string, keyName: string) =>
  keyType + '.`' + keyName + '`';

/**
 * Creates canonical sort key name for metrics and params
 */
export const isCanonicalSortKeyOfType = (canonicalKey: string, keyType: string) =>
  canonicalKey.startsWith(keyType);

/**
 * Extracts param/metric/tag name from the canonical key
 */
export const extractCanonicalSortKey = (canonicalKey: string, keyType: string) =>
  canonicalKey.substring(keyType.length + 2).slice(0, -1);

/*
 * Functions used to generate grid field names for params, metrics and prefixes
 */
const createParamFieldName = (key: string) => `${EXPERIMENT_FIELD_PREFIX_PARAM}-${key}`;
const createMetricFieldName = (key: string) => `${EXPERIMENT_FIELD_PREFIX_METRIC}-${key}`;
const createTagFieldName = (key: string) => `${EXPERIMENT_FIELD_PREFIX_TAG}-${key}`;

/**
 * Functions returns all framework components to be used by agGrid
 */
export const getFrameworkComponents = () => ({
  agColumnHeader: ColumnHeaderCell,
  loadingOverlayComponent: Spinner,

  /**
   * We're saving cell renderer component references, otherwise
   * agGrid will unnecessarily flash cells' content (e.g. when changing sort order)
   */
  LoadMoreRowRenderer,
  SourceCellRenderer,
  ModelsCellRenderer,
  VersionCellRenderer,
  DateCellRenderer,
  ExperimentNameCellRenderer,
  RowActionsCellRenderer,
  RowActionsHeaderCellRenderer,
  RunNameCellRenderer,
});

/**
 * Certain columns are described as run attributes (opposed to metrics, params etc.), however
 * they actually source their data from the run tags. This objects maps tag names to column identifiers.
 */
export const TAGS_TO_COLUMNS_MAP = {
  [ATTRIBUTE_COLUMN_SORT_KEY.USER]: makeCanonicalSortKey(COLUMN_TYPES.ATTRIBUTES, 'User'),
  [ATTRIBUTE_COLUMN_SORT_KEY.RUN_NAME]: makeCanonicalSortKey(COLUMN_TYPES.ATTRIBUTES, 'Run Name'),
  [ATTRIBUTE_COLUMN_SORT_KEY.SOURCE]: makeCanonicalSortKey(COLUMN_TYPES.ATTRIBUTES, 'Source'),
  [ATTRIBUTE_COLUMN_SORT_KEY.VERSION]: makeCanonicalSortKey(COLUMN_TYPES.ATTRIBUTES, 'Version'),
};

/**
 * Function returns unique row ID to be used in runs table
 */
export const getRowId = ({ data }: { data: RunRowType }) => data.runUuid;

/**
 * Determines if a data row houses "load more" button
 */
export const getRowIsLoadMore = ({ rowNode }: IsFullWidthRowParams) => rowNode.data.isLoadMoreRow;

/**
 * Parameters used by `useRunsColumnDefinitions()` hook
 */
export interface UseRunsColumnDefinitionsParams {
  searchFacetsState: SearchExperimentRunsFacetsState;
  onSortBy: (newOrderByKey: string, newOrderByAsc: boolean) => void;
  onExpand: (parentUuid: string, childrenIds: string[]) => void;
  onTogglePin: (runUuid: string) => void;
  onToggleVisibility: (runUuidOrToggle: string) => void;
  compareExperiments: boolean;
  metricKeyList: string[];
  paramKeyList: string[];
  tagKeyList: string[];
  columnApi?: ColumnApi;
  isComparingRuns?: boolean;
}

/**
 * List of all attribute columns that can be shown/hidden by user
 * - when displaying a single experiment (ADJUSTABLE_ATTRIBUTE_COLUMNS_SINGLE_EXPERIMENT)
 * - when comparing experiments (ADJUSTABLE_ATTRIBUTE_COLUMNS)
 */
export const ADJUSTABLE_ATTRIBUTE_COLUMNS_SINGLE_EXPERIMENT = [
  ATTRIBUTE_COLUMN_LABELS.USER,
  ATTRIBUTE_COLUMN_LABELS.SOURCE,
  ATTRIBUTE_COLUMN_LABELS.VERSION,
  ATTRIBUTE_COLUMN_LABELS.MODELS,
];
export const ADJUSTABLE_ATTRIBUTE_COLUMNS = [
  ATTRIBUTE_COLUMN_LABELS.EXPERIMENT_NAME,
  ...ADJUSTABLE_ATTRIBUTE_COLUMNS_SINGLE_EXPERIMENT,
];

/**
 * This internal hook passes through the list of all metric/param/tag keys.
 * The lists are memoized internally so if somehow a particular param/metric/tag key is not present
 * in the new runs set (e.g. due to reverse sorting), the relevant column will be still displayed.
 * This prevents weirdly disappearing columns on exotic run sets.
 */
const useCumulativeColumnKeys = ({
  paramKeyList,
  metricKeyList,
  tagKeyList,
}: Pick<UseRunsColumnDefinitionsParams, 'tagKeyList' | 'metricKeyList' | 'paramKeyList'>) => {
  const cachedMetricKeys = useRef<Set<string>>(new Set());
  const cachedParamKeys = useRef<Set<string>>(new Set());
  const cachedTagKeys = useRef<Set<string>>(new Set());

  const paramKeys = useMemo(() => {
    paramKeyList.forEach((key) => cachedParamKeys.current.add(key));
    return Array.from(cachedParamKeys.current);
  }, [paramKeyList]);

  const metricKeys = useMemo(() => {
    metricKeyList.forEach((key) => cachedMetricKeys.current.add(key));
    return Array.from(cachedMetricKeys.current);
  }, [metricKeyList]);

  const tagKeys = useMemo(() => {
    tagKeyList.forEach((key) => cachedTagKeys.current.add(key));
    return Array.from(cachedTagKeys.current);
  }, [tagKeyList]);

  const cumulativeColumns = useMemo(
    () => ({
      paramKeys,
      metricKeys,
      tagKeys,
    }),
    [metricKeys, paramKeys, tagKeys],
  );

  return cumulativeColumns;
};

/**
 * This hook creates a agGrid-compatible column set definition basing on currently
 * used sort-filter model and provided list of metrics, params and tags.
 *
 * Internally, it reacts to changes to `selectedColumns` and hides/shows relevant columns
 * if necessary.
 *
 * @param params see UseRunsColumnDefinitionsParams
 */
export const useRunsColumnDefinitions = ({
  searchFacetsState,
  onSortBy,
  compareExperiments,
  onTogglePin,
  onToggleVisibility,
  onExpand,
  paramKeyList,
  metricKeyList,
  tagKeyList,
  columnApi,
  isComparingRuns,
}: UseRunsColumnDefinitionsParams) => {
  const { orderByAsc, orderByKey, selectedColumns } = searchFacetsState;

  const cumulativeColumns = useCumulativeColumnKeys({
    metricKeyList,
    tagKeyList,
    paramKeyList,
  });

  const columnSet = useMemo(() => {
    const commonSortOrderProps = { orderByKey, orderByAsc, onSortBy };

    const getOrderedByClassName = (key: string) =>
      key === orderByKey ? 'is-ordered-by' : undefined;

    const getHeaderClassName = (key: string) => getOrderedByClassName(key);
    const getCellClassName = ({ colDef }: { colDef: ColDef }) =>
      getOrderedByClassName(colDef.headerComponentParams.canonicalSortKey);

    const columns: ColDefWithChildren[] = [];

    // Checkbox selection column
    columns.push({
      valueGetter: ({ data: { pinned, hidden } }) => ({ pinned, hidden }),
      checkboxSelection: !isComparingRuns,
      headerComponent: shouldUseNextRunsComparisonUI() ? 'RowActionsHeaderCellRenderer' : undefined,
      headerComponentParams: { onToggleVisibility },
      headerCheckboxSelection: !isComparingRuns,
      headerName: '',
      cellClass: 'is-checkbox-cell',
      cellRenderer: 'RowActionsCellRenderer',
      cellRendererParams: { onTogglePin, onToggleVisibility },
      pinned: 'left',
      minWidth: getActionsColumnWidth(isComparingRuns),
      width: getActionsColumnWidth(isComparingRuns),
      maxWidth: getActionsColumnWidth(isComparingRuns),
      resizable: false,
    });

    // Run name column
    columns.push({
      headerName: ATTRIBUTE_COLUMN_LABELS.RUN_NAME,
      colId: TAGS_TO_COLUMNS_MAP[ATTRIBUTE_COLUMN_SORT_KEY.RUN_NAME],
      headerTooltip: ATTRIBUTE_COLUMN_SORT_KEY.RUN_NAME,
      pinned: 'left',
      sortable: true,
      field: 'runDateAndNestInfo',
      cellRenderer: 'RunNameCellRenderer',
      cellRendererParams: { onExpand },
      equals: (dateInfo1, dateInfo2) => isEqual(dateInfo1, dateInfo2),
      headerComponentParams: {
        ...commonSortOrderProps,
        canonicalSortKey: ATTRIBUTE_COLUMN_SORT_KEY.RUN_NAME,
        getClassName: getHeaderClassName,
      },
      cellClass: getCellClassName,
      initialWidth: getRunNameColumnWidth(),
      resizable: !isComparingRuns,
    });

    // If we are only comparing runs, that's it - we cut off the list after the run name column.
    // This behavior might be revisited and changed later.
    if (isComparingRuns) {
      return columns;
    }

    // Date and expander selection column
    columns.push({
      headerName: ATTRIBUTE_COLUMN_LABELS.DATE,
      headerTooltip: ATTRIBUTE_COLUMN_SORT_KEY.DATE,
      pinned: 'left',
      sortable: true,
      field: 'runDateAndNestInfo',
      cellRenderer: 'DateCellRenderer',
      cellRendererParams: { onExpand },
      equals: (dateInfo1, dateInfo2) => isEqual(dateInfo1, dateInfo2),
      headerComponentParams: {
        ...commonSortOrderProps,
        canonicalSortKey: ATTRIBUTE_COLUMN_SORT_KEY.DATE,
        getClassName: getHeaderClassName,
      },
      cellClass: getCellClassName,
      initialWidth: 150,
    });

    // Duration column
    columns.push({
      headerName: ATTRIBUTE_COLUMN_LABELS.DURATION,
      field: 'duration',
      initialWidth: 80,
      cellClass: getCellClassName,
    });

    // Experiment name column
    if (compareExperiments) {
      columns.push({
        headerName: ATTRIBUTE_COLUMN_LABELS.EXPERIMENT_NAME,
        colId: makeCanonicalSortKey(
          COLUMN_TYPES.ATTRIBUTES,
          ATTRIBUTE_COLUMN_LABELS.EXPERIMENT_NAME,
        ),
        field: 'experimentName',
        cellRenderer: 'ExperimentNameCellRenderer',
        equals: (experimentName1, experimentName2) => isEqual(experimentName1, experimentName2),
        initialWidth: 140,
        cellClass: getCellClassName,
        initialHide: true,
      });
    }

    // User column
    columns.push({
      headerName: ATTRIBUTE_COLUMN_LABELS.USER,
      colId: TAGS_TO_COLUMNS_MAP[ATTRIBUTE_COLUMN_SORT_KEY.USER],
      headerTooltip: ATTRIBUTE_COLUMN_SORT_KEY.USER,
      field: 'user',
      sortable: true,
      headerComponentParams: {
        ...commonSortOrderProps,
        canonicalSortKey: ATTRIBUTE_COLUMN_SORT_KEY.USER,
        getClassName: getHeaderClassName,
      },
      cellClass: getCellClassName,
      initialHide: true,
    });

    // Source column
    columns.push({
      headerName: ATTRIBUTE_COLUMN_LABELS.SOURCE,
      colId: TAGS_TO_COLUMNS_MAP[ATTRIBUTE_COLUMN_SORT_KEY.SOURCE],
      field: 'tags',
      cellRenderer: 'SourceCellRenderer',
      equals: (tags1, tags2) => Utils.getSourceName(tags1) === Utils.getSourceName(tags2),
      sortable: true,
      headerComponentParams: {
        ...commonSortOrderProps,
        canonicalSortKey: ATTRIBUTE_COLUMN_SORT_KEY.SOURCE,
        getClassName: getHeaderClassName,
      },
      cellClass: getCellClassName,
      initialHide: true,
    });

    // Version column
    columns.push({
      headerName: ATTRIBUTE_COLUMN_LABELS.VERSION,
      colId: TAGS_TO_COLUMNS_MAP[ATTRIBUTE_COLUMN_SORT_KEY.VERSION],
      field: 'version',
      cellRenderer: 'VersionCellRenderer',
      equals: (version1, version2) => isEqual(version1, version2),
      sortable: true,
      headerComponentParams: {
        ...commonSortOrderProps,
        canonicalSortKey: ATTRIBUTE_COLUMN_SORT_KEY.VERSION,
        getClassName: getHeaderClassName,
      },
      cellClass: getCellClassName,
      initialHide: true,
    });

    // Models column
    columns.push({
      headerName: ATTRIBUTE_COLUMN_LABELS.MODELS,
      colId: makeCanonicalSortKey(COLUMN_TYPES.ATTRIBUTES, ATTRIBUTE_COLUMN_LABELS.MODELS),
      field: 'models',
      cellRenderer: 'ModelsCellRenderer',
      initialWidth: 200,
      equals: (models1, models2) => isEqual(models1, models2),
      initialHide: true,
    });

    const { metricKeys, paramKeys, tagKeys } = cumulativeColumns;

    // Metrics columns
    if (metricKeys.length) {
      columns.push({
        headerName: 'Metrics',
        colId: COLUMN_TYPES.METRICS,
        children: metricKeys.map((metricKey) => {
          const canonicalSortKey = makeCanonicalSortKey(COLUMN_TYPES.METRICS, metricKey);
          return {
            headerName: metricKey,
            colId: canonicalSortKey,
            headerTooltip: getQualifiedEntityName(COLUMN_TYPES.METRICS, metricKey),
            field: createMetricFieldName(metricKey),
            tooltipField: createMetricFieldName(metricKey),
            initialWidth: 100,
            initialHide: true,
            sortable: true,
            headerComponentParams: {
              ...commonSortOrderProps,
              canonicalSortKey,
              getClassName: getHeaderClassName,
            },
            cellClass: getCellClassName,
          };
        }),
      });
    }

    // Parameter columns
    if (paramKeys.length) {
      columns.push({
        headerName: 'Parameters',
        colId: COLUMN_TYPES.PARAMS,
        children: paramKeys.map((paramKey) => {
          const canonicalSortKey = makeCanonicalSortKey(COLUMN_TYPES.PARAMS, paramKey);
          return {
            colId: canonicalSortKey,
            headerName: paramKey,
            headerTooltip: getQualifiedEntityName(COLUMN_TYPES.PARAMS, paramKey),
            field: createParamFieldName(paramKey),
            tooltipField: createParamFieldName(paramKey),
            initialHide: true,
            initialWidth: 100,
            sortable: true,
            headerComponentParams: {
              ...commonSortOrderProps,
              canonicalSortKey,
              getClassName: getHeaderClassName,
            },
            cellClass: getCellClassName,
          };
        }),
      });
    }

    // Tags columns
    if (tagKeys.length) {
      columns.push({
        headerName: 'Tags',
        colId: COLUMN_TYPES.TAGS,
        children: tagKeys.map((tagKey) => {
          const canonicalSortKey = makeCanonicalSortKey(COLUMN_TYPES.TAGS, tagKey);
          return {
            colId: canonicalSortKey,
            headerName: tagKey,
            initialHide: true,
            initialWidth: 100,
            headerTooltip: getQualifiedEntityName(COLUMN_TYPES.TAGS, tagKey),
            field: createTagFieldName(tagKey),
            tooltipField: createTagFieldName(tagKey),
          };
        }),
      });
    }

    return columns;
  }, [
    orderByKey,
    orderByAsc,
    onSortBy,
    onTogglePin,
    onToggleVisibility,
    onExpand,
    compareExperiments,
    cumulativeColumns,
    isComparingRuns,
  ]);

  const canonicalSortKeys = useMemo(
    () => [
      ...ADJUSTABLE_ATTRIBUTE_COLUMNS.map((key) =>
        makeCanonicalSortKey(COLUMN_TYPES.ATTRIBUTES, key),
      ),
      ...cumulativeColumns.paramKeys.map((key) => makeCanonicalSortKey(COLUMN_TYPES.PARAMS, key)),
      ...cumulativeColumns.metricKeys.map((key) => makeCanonicalSortKey(COLUMN_TYPES.METRICS, key)),
      ...cumulativeColumns.tagKeys.map((key) => makeCanonicalSortKey(COLUMN_TYPES.TAGS, key)),
    ],
    [cumulativeColumns],
  );

  useEffect(() => {
    if (!columnApi || isComparingRuns) {
      return;
    }
    for (const canonicalKey of canonicalSortKeys) {
      const visible = selectedColumns.includes(canonicalKey);
      columnApi.setColumnVisible(canonicalKey, visible);
    }
  }, [selectedColumns, columnApi, canonicalSortKeys, isComparingRuns]);

  return columnSet;
};

type ColDefWithChildren = ColDef & {
  children?: ColDef[];
};

export const EXPERIMENTS_DEFAULT_COLUMN_SETUP = {
  initialWidth: 100,
  autoSizePadding: 0,
  headerComponentParams: { menuIcon: 'fa-bars' },
  resizable: true,
  filter: true,
  suppressMenu: true,
  suppressMovable: true,
};
