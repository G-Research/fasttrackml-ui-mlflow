import React, { useEffect, useState } from 'react';
import { getSrc } from './ShowArtifactPage';
import { getArtifactContent } from '../../../common/utils/ArtifactUtils';
import { LegacyTable } from '@databricks/design-system';
import { FormattedMessage } from 'react-intl';
// @ts-expect-error TS(7016): Could not find a declaration file for module 'papa... Remove this comment to see the full error message
import Papa from 'papaparse';

type OwnProps = {
  runUuid: string;
  path: string;
  getArtifact?: (...args: any[]) => any;
};

// @ts-expect-error TS(2456): Type alias 'Props' circularly references itself.
type Props = OwnProps & typeof ShowArtifactTableView.defaultProps;

// @ts-expect-error TS(7022): 'ShowArtifactTableView' implicitly has type 'any' ... Remove this comment to see the full error message
const ShowArtifactTableView = ({ runUuid, path, getArtifact }: Props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [data, setData] = useState();
  const [headers, setHeaders] = useState();
  const [text, setText] = useState();

  const MAX_NUM_ROWS = 500;

  useEffect(() => {
    resetState();
    fetchArtifacts({ path, runUuid, getArtifact });
  }, [runUuid, path, getArtifact]);

  function resetState() {
    // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
    setError();
    // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
    setData();
    // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
    setHeaders();
    // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
    setText();
    setLoading(true);
  }

  function fetchArtifacts(artifactData: any) {
    const artifactLocation = getSrc(artifactData.path, artifactData.runUuid);
    artifactData
      .getArtifact(artifactLocation)
      .then((artifactText: any) => {
        try {
          const result = Papa.parse(artifactText, {
            header: true,
            preview: MAX_NUM_ROWS,
            skipEmptyLines: 'greedy',
          });
          const dataPreview = result.data;

          if (result.errors.length > 0) {
            throw Error(result.errors[0].message);
          }

          setLoading(false);
          setHeaders(result.meta.fields);
          setData(dataPreview);
        } catch (_) {
          setLoading(false);
          setText(artifactText);
        }
      })
      .catch((e: any) => {
        setError(e);
        setLoading(false);
      });
  }

  if (loading) {
    return <div className='artifact-text-view-loading'>Loading...</div>;
  }
  if (error) {
    return (
      <div className='artifact-text-view-error'>
        Oops we couldn't load your file because of an error.
      </div>
    );
  }

  if (data) {
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    const columns = headers.map((f: any) => ({
      title: f,
      dataIndex: f,
      key: f,
      sorter: (a: any, b: any) => a[f].localeCompare(b[f]),
      width: 200,

      ellipsis: {
        showTitle: true,
      },
    }));

    const numRows = (data as any).length;

    return (
      <div css={{ overscrollBehaviorX: 'contain', overflowX: 'scroll', margin: 10 }}>
        <span css={{ display: 'flex', justifyContent: 'center' }}>
          <FormattedMessage
            defaultMessage='Previewing the first {numRows} rows'
            description='Title for showing the number of rows in the parsed data preview'
            values={{ numRows }}
          />
        </span>
        <LegacyTable
          columns={columns}
          dataSource={data}
          pagination={false}
          sticky
          // @ts-expect-error TS(2322): Type 'true' is not assignable to type 'string | nu... Remove this comment to see the full error message
          scroll={{ x: 'min-content', y: true }}
        />
      </div>
    );
  } else {
    return (
      <div className='ShowArtifactPage'>
        <div className='text-area-border-box'>{text}</div>
      </div>
    );
  }
};

ShowArtifactTableView.defaultProps = {
  getArtifact: getArtifactContent,
};

export default ShowArtifactTableView;
