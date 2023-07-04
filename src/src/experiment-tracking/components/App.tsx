import React, { Component } from 'react';
import { connect } from 'react-redux';
import { HashRouter as Router, Link, NavLink, Switch } from 'react-router-dom';
import { CompatRouter, CompatRoute as Route } from 'react-router-dom-v5-compat';
import AppErrorBoundary from '../../common/components/error-boundaries/AppErrorBoundary';
import { HomePageDocsUrl, Version } from '../../common/constants';
// @ts-expect-error TS(2307): Cannot find module '../../common/static/home-logo.... Remove this comment to see the full error message
import logo from '../../common/static/home-logo.png';
import ErrorModal from '../../experiment-tracking/components/modals/ErrorModal';
import { CompareModelVersionsPage } from '../../model-registry/components/CompareModelVersionsPage';
import { ModelListPage } from '../../model-registry/components/ModelListPage';
import { ModelPage } from '../../model-registry/components/ModelPage';
import { ModelVersionPage } from '../../model-registry/components/ModelVersionPage';
import {
  compareModelVersionsPageRoute,
  modelListPageRoute,
  modelPageRoute,
  modelSubpageRoute,
  modelSubpageRouteWithName,
  modelVersionPageRoute,
} from '../../model-registry/routes';
import Routes from '../routes';
import './App.css';
import CompareRunPage from './CompareRunPage';
import { HomePage } from './HomePage';
import { MetricPage } from './MetricPage';
import { PageNotFoundView } from './PageNotFoundView';
import { RunPage } from './RunPage';
import { DirectRunPage } from './DirectRunPage';

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
  render() {
    const marginRight = 24;
    return (
      <Router
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
                  <Link to={Routes.rootRoute} className='App-mlflow'>
                    <img className='mlflow-logo' alt='MLflow' src={logo} />
                  </Link>
                  <span className={'mlflow-version'}>{Version}</span>
                </div>
                <div className='header-route-links'>
                  <NavLink
                    strict
                    to={Routes.rootRoute}
                    css={{ marginRight }}
                    activeStyle={classNames.activeNavLink}
                    isActive={isExperimentsActive}
                    className='header-nav-link'
                  >
                    <div className='experiments'>
                      <span>Experiments</span>
                    </div>
                  </NavLink>
                  <NavLink
                    strict
                    to={modelListPageRoute}
                    css={{ marginRight }}
                    activeStyle={classNames.activeNavLink}
                    className='header-nav-link header-nav-link-models'
                  >
                    <div className='models'>
                      <span>Models</span>
                    </div>
                  </NavLink>
                </div>
                <div className='header-links'>
                  <a href={'https://github.com/mlflow/mlflow'} css={{ marginRight }}>
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
            {/* @ts-expect-error TS(2322): Type '{ children: Element; service: string; }' is ... Remove this comment to see the full error message */}
            <AppErrorBoundary service='mlflow'>
              <InteractionTracker>
                <Switch>
                  <Route exact path={Routes.rootRoute} component={HomePage} />
                  <Route exact path={Routes.experimentPageRoute} component={HomePage} />
                  <Route exact path={Routes.runPageWithArtifactSelectedRoute} component={RunPage} />
                  <Route exact path={Routes.runPageRoute} component={RunPage} />
                  <Route exact path={Routes.directRunPageRoute} component={DirectRunPage} />
                  <Route exact path={Routes.metricPageRoute} component={MetricPage} />
                  <Route exact path={Routes.compareRunPageRoute} component={CompareRunPage} />
                  <Route
                    exact
                    path={Routes.compareExperimentsSearchPageRoute}
                    component={HomePage}
                  />
                  <Route path={Routes.experimentPageSearchRoute} component={HomePage} />
                  {/* TODO(Zangr) see if route component can be injected here */}
                  <Route exact path={modelListPageRoute} component={ModelListPage} />
                  <Route exact path={modelVersionPageRoute} component={ModelVersionPage} />
                  <Route exact path={modelPageRoute} component={ModelPage} />
                  <Route exact path={modelSubpageRoute} component={ModelPage} />
                  <Route exact path={modelSubpageRouteWithName} component={ModelPage} />
                  <Route
                    exact
                    path={compareModelVersionsPageRoute}
                    component={CompareModelVersionsPage}
                  />
                  <Route component={PageNotFoundView} />
                </Switch>
              </InteractionTracker>
            </AppErrorBoundary>
          </div>
        </CompatRouter>
      </Router>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    experiments: Object.values(state.entities.experimentsById),
  };
};

export default connect(mapStateToProps)(App);
