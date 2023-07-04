export const getBasename = (path: any) => {
  const parts = path.split('/');
  return parts[parts.length - 1];
};

export const getExtension = (path: any) => {
  const parts = path.split(/[./]/);
  return parts[parts.length - 1];
};

export const getLanguage = (path: any) => {
  const ext = getExtension(path).toLowerCase();
  if (ext in MLFLOW_FILE_LANGUAGES) {
    return MLFLOW_FILE_LANGUAGES[ext];
  }
  return ext;
};

export const MLPROJECT_FILE_NAME = 'mlproject';
export const MLMODEL_FILE_NAME = 'mlmodel';

export const MLFLOW_FILE_LANGUAGES = {
  [MLPROJECT_FILE_NAME.toLowerCase()]: 'yaml',
  [MLMODEL_FILE_NAME.toLowerCase()]: 'yaml',
};

export const IMAGE_EXTENSIONS = new Set(['jpg', 'bmp', 'jpeg', 'png', 'gif', 'svg']);
export const TEXT_EXTENSIONS = new Set([
  'txt',
  'log',
  'err',
  'cfg',
  'conf',
  'cnf',
  'cf',
  'ini',
  'properties',
  'prop',
  'hocon',
  'toml',
  'yaml',
  'yml',
  'xml',
  'json',
  'js',
  'py',
  'py3',
  'md',
  'rst',
  MLPROJECT_FILE_NAME.toLowerCase(),
  MLMODEL_FILE_NAME.toLowerCase(),
  'jsonnet',
]);
export const HTML_EXTENSIONS = new Set(['html']);
export const MAP_EXTENSIONS = new Set(['geojson']);
export const PDF_EXTENSIONS = new Set(['pdf']);
export const DATA_EXTENSIONS = new Set(['csv', 'tsv']);
