/**
 * NOTE: this code file was automatically migrated to TypeScript using ts-migrate and
 * may contain multiple `any` type annotations and `@ts-expect-error` directives.
 * If possible, please improve types while making changes to this file. If the type
 * annotations are already looking good, please remove this comment.
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Select } from 'antd';

import {
  HashRouterV5,
  Route,
  Routes,
  CompatRouter,
  LinkV5,
  NavLinkV5,
} from '../../common/utils/RoutingUtils';

import AppErrorBoundary from '../../common/components/error-boundaries/AppErrorBoundary';
import { HomePageDocsUrl } from '../../common/constants';
import { fetchEndpoint, getBasePath } from '../../common/utils/FetchUtils';
import logo from '../../common/static/home-logo.svg';
import ErrorModal from '../../experiment-tracking/components/modals/ErrorModal';
import { CompareModelVersionsPage } from '../../model-registry/components/CompareModelVersionsPage';
import { ModelListPage } from '../../model-registry/components/ModelListPage';
import { ModelPage } from '../../model-registry/components/ModelPage';
import { ModelVersionPage } from '../../model-registry/components/ModelVersionPage';
import { ModelRegistryRoutes, ModelRegistryRoutePaths } from '../../model-registry/routes';
import ExperimentTrackingRoutes, { RoutePaths as ExperimentTrackingRoutePaths } from '../routes';
import './App.css';
import CompareRunPage from './CompareRunPage';
import { HomePage } from './HomePage';
import { MetricPage } from './MetricPage';
import { PageNotFoundView } from '../../common/components/PageNotFoundView';
import { RunPage } from './RunPage';
import { DirectRunPage } from './DirectRunPage';
import { shouldEnableDeepLearningUI } from '../../common/utils/FeatureUtils';

const isExperimentsActive = (match: any, location: any) => {
  // eslint-disable-next-line prefer-const
  return match && !location.pathname.includes('models');
};

let mlflowHashRouting = false;

export function setMLFlowHashRouting() {
  mlflowHashRouting = true;
}

const classNames = {
  activeNavLink: { borderBottom: '4px solid #43C9ED' },
};

// eslint-disable-next-line no-unused-vars
const InteractionTracker = ({ children }: any) => children;

class App extends Component {
  state: {
    selectedNamespace: string; namespaces: string[];
    version: string;
  };
  constructor(props: any) {
    super(props);
    this.state = {
      selectedNamespace: '',
      namespaces: [],
      version: 'unknown',
    };
    this.handleNamespaceChange = this.handleNamespaceChange.bind(this);
  }

  handleNamespaceChange = (value: string) => {
    this.setState({ 
      selectedNamespace: value,
    }, () => {
      const namespace = value === 'default' ? '' : `/ns/${value}`;
      window.location.href = `${window.location.origin}${namespace}/mlflow/`;
    });
  }

  componentDidMount() {
    fetch('/version').then((response) => {
      response.text().then((version) => {
        this.setState({
          version: version,
        });
      });
    });

    fetch(`/chooser/namespaces`)
    .then((response) => response.json())
      .then((data) => {
        this.setState({
          namespaces: data.map((item: { code: any }) => item.code),
        });
      });

    fetch(`${getBasePath()}chooser/namespaces/current`)
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          selectedNamespace: data.code,
        });
      });
  }

  render() {
    const marginRight = 24;
    return (
      <HashRouterV5
        basename={mlflowHashRouting ? '/mlflow' : undefined}
        hashType={mlflowHashRouting ? 'noslash' : undefined}
      >
        {/* This layer enables intercompatibility between react-router APIs v5 and v6 */}
        {/* TODO: Remove after migrating to react-router v6 */}
        <CompatRouter>
          <div style={{ height: '100%' }}>
            <ErrorModal />
            {/* @ts-expect-error TS(4111): Property 'HIDE_HEADER' comes from an index signatu... Remove this comment to see the full error message */}
            {process.env.HIDE_HEADER === 'true' ? null : (
              <header className='App-header'>
                <div className='mlflow-logo'>
                  <LinkV5 to={ExperimentTrackingRoutes.rootRoute} className='App-mlflow'>
                    <img className='mlflow-logo' alt='MLflow' src={logo} />
                  </LinkV5>
                  <span className={'mlflow-version'}>{this.state.version}</span>
                </div>
                <div className='header-route-links'>
                  <NavLinkV5
                    strict
                    to={ExperimentTrackingRoutes.rootRoute}
                    css={{ marginRight }}
                    activeStyle={classNames.activeNavLink}
                    isActive={isExperimentsActive}
                    className='header-nav-link'
                  >
                    <div className='experiments'>
                      <span>Experiments</span>
                    </div>
                  </NavLinkV5>
                </div>
                <div className='header-links'>
                <Select 
                  size='small'
                  value={this.state.selectedNamespace} 
                  onChange={this.handleNamespaceChange}
                  style={{ marginRight: 15, color: '#e7f1fb', fontSize: 16 }}
                  bordered={false}
                  dropdownMatchSelectWidth={false}
                  className="namespace-select"
                >
                  {this.state.namespaces.map((namespace) => (
                    <Select.Option value={namespace}>
                      {namespace}
                    </Select.Option>
                  ))}
                </Select>
                  <a href={'../'} css={{ marginRight }}>
                    <div className='github'>
                      <span>Switch UI</span>
                    </div>
                  </a>
                  <a href={'https://github.com/G-Research/fasttrackml'} css={{ marginRight }}>
                    <div className='github'>
                      <span>GitHub</span>
                    </div>
                  </a>
                  <a href={HomePageDocsUrl} css={{ marginRight }}>
                    <div className='docs'>
                      <span>Docs</span>
                    </div>
                  </a>
                </div>
              </header>
            )}
            <AppErrorBoundary service='mlflow'>
              <InteractionTracker>
                {/* The block below contains React Router v6 routes */}
                <Routes>
                  <Route
                    path={ExperimentTrackingRoutePaths.compareExperimentsSearch}
                    element={<HomePage />}
                  />
                  <Route
                    path={ExperimentTrackingRoutePaths.experimentPageSearch}
                    element={<HomePage />}
                  />
                  <Route
                    path={ExperimentTrackingRoutePaths.experimentPage}
                    element={<HomePage />}
                  />
                  <Route path={ExperimentTrackingRoutePaths.rootRoute} element={<HomePage />} />
                  {/* If deep learning UI features are enabled, use more
                      versatile route (with backward compatibility) */}
                  {shouldEnableDeepLearningUI() ? (
                    <Route
                      path={ExperimentTrackingRoutePaths.runPageWithTab}
                      element={<RunPage />}
                    />
                  ) : (
                    <>
                      <Route
                        path={ExperimentTrackingRoutePaths.runPageWithArtifact}
                        element={<RunPage />}
                      />
                      <Route path={ExperimentTrackingRoutePaths.runPage} element={<RunPage />} />
                    </>
                  )}
                  <Route
                    path={ExperimentTrackingRoutePaths.runPageDirect}
                    element={<DirectRunPage />}
                  />
                  <Route path={ExperimentTrackingRoutePaths.metricPage} element={<MetricPage />} />
                  <Route
                    path={ExperimentTrackingRoutePaths.compareRuns}
                    element={<CompareRunPage />}
                  />
                  <Route path={ModelRegistryRoutePaths.modelListPage} element={<ModelListPage />} />
                  <Route
                    path={ModelRegistryRoutePaths.modelVersionPage}
                    element={<ModelVersionPage />}
                  />
                  <Route path={ModelRegistryRoutePaths.modelPage} element={<ModelPage />} />
                  <Route path={ModelRegistryRoutePaths.modelSubpage} element={<ModelPage />} />
                  <Route
                    path={ModelRegistryRoutePaths.modelSubpageRouteWithName}
                    element={<ModelPage />}
                  />
                  <Route
                    path={ModelRegistryRoutePaths.compareModelVersionsPage}
                    element={<CompareModelVersionsPage />}
                  />
                  <Route path='/*' element={<PageNotFoundView />} />
                </Routes>
                {/* End of React Router v6 routes */}
              </InteractionTracker>
            </AppErrorBoundary>
          </div>
        </CompatRouter>
      </HashRouterV5>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    experiments: Object.values(state.entities.experimentsById),
  };
};

export default connect(mapStateToProps)(App);
