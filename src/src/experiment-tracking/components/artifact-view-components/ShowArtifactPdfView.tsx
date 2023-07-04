import React, { Component } from 'react';
import { getSrc } from './ShowArtifactPage';
// @ts-expect-error TS(7016): Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Document, Page, pdfjs } from 'react-pdf';
import { Pagination, Spinner } from '@databricks/design-system';
import { getArtifactBytesContent } from '../../../common/utils/ArtifactUtils';
import './ShowArtifactPdfView.css';
import Utils from '../../../common/utils/Utils';
import { ErrorWrapper } from '../../../common/utils/ErrorWrapper';

// See: https://github.com/wojtekmaj/react-pdf/blob/master/README.md#enable-pdfjs-worker for how
// workerSrc is supposed to be specified.
pdfjs.GlobalWorkerOptions.workerSrc = `./static-files/pdf.worker.js`;

type OwnProps = {
  runUuid: string;
  path: string;
  getArtifact?: (...args: any[]) => any;
};

type State = any;

type Props = OwnProps & typeof ShowArtifactPdfView.defaultProps;

class ShowArtifactPdfView extends Component<Props, State> {
  state = {
    loading: true,
    error: undefined,
    pdfData: undefined,
    currentPage: 1,
    numPages: 1,
  };

  static defaultProps = {
    getArtifact: getArtifactBytesContent,
  };

  /** Fetches artifacts and updates component state with the result */
  fetchPdf() {
    const artifactLocation = getSrc(this.props.path, this.props.runUuid);
    this.props
      .getArtifact(artifactLocation)
      .then((artifactPdfData: any) => {
        this.setState({ pdfData: { data: artifactPdfData }, loading: false });
      })
      .catch((error: any) => {
        this.setState({ error: error, loading: false });
      });
  }

  componentDidMount() {
    this.fetchPdf();
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.path !== prevProps.path || this.props.runUuid !== prevProps.runUuid) {
      this.fetchPdf();
    }
  }

  onDocumentLoadSuccess = ({ numPages }: any) => {
    this.setState({ numPages });
  };

  onDocumentLoadError = (error: any) => {
    Utils.logErrorAndNotifyUser(new ErrorWrapper(error));
  };

  onPageChange = (newPageNumber: any, itemsPerPage: any) => {
    this.setState({ currentPage: newPageNumber });
  };

  renderPdf = () => {
    return (
      <React.Fragment>
        <div className='pdf-viewer'>
          <div className='paginator'>
            <Pagination
              // @ts-expect-error TS(2322): Type '{ simple: true; currentPageIndex: number; nu... Remove this comment to see the full error message
              simple
              currentPageIndex={this.state.currentPage}
              numTotal={this.state.numPages}
              pageSize={1}
              onChange={this.onPageChange}
              /*
               * Currently DuBois pagination does not natively support
               * "simple" mode which is required here, hence `dangerouslySetAntdProps`
               */
              dangerouslySetAntdProps={{ simple: true }}
            />
          </div>
          <div className='document'>
            <Document
              file={this.state.pdfData}
              onLoadSuccess={this.onDocumentLoadSuccess}
              onLoadError={this.onDocumentLoadError}
              loading={<Spinner />}
            >
              <Page pageNumber={this.state.currentPage} loading={<Spinner />} />
            </Document>
          </div>
        </div>
      </React.Fragment>
    );
  };

  render() {
    if (this.state.loading) {
      return <div className='artifact-pdf-view-loading'>Loading...</div>;
    }
    if (this.state.error) {
      return (
        <div className='artifact-pdf-view-error'>
          Oops we couldn't load your file because of an error. Please reload the page to try again.
        </div>
      );
    } else {
      return <div className='pdf-outer-container'>{this.renderPdf()}</div>;
    }
  }
}

export default ShowArtifactPdfView;
