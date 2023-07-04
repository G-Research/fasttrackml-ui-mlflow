/**
 * This file aggregates utility functions for enabling features configured by flags.
 * In the OSS version, you can override them in local development by manually changing the return values.
 */
/**
 * UI feature preview: new ("next") version of runs comparison view within experiment runs table.
 */
export const shouldUseNextRunsComparisonUI = () => true;
/**
 * Use unified pattern for all list pages (model list page etc.)
 */
export const shouldUseUnifiedListPattern = () => false;
/**
 * Disable legacy charts on "compare runs" page in favor of a new chart view
 */
export const shouldDisableLegacyRunCompareCharts = () => false;
