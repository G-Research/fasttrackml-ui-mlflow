import React from 'react';
import { PageWrapper, Spacer } from '@databricks/design-system';

type OwnProps = {
  usesFullHeight?: boolean;
  children?: React.ReactNode;
};

// @ts-expect-error TS(2565): Property 'defaultProps' is used before being assig... Remove this comment to see the full error message
type Props = OwnProps & typeof PageContainer.defaultProps;

export function PageContainer(props: Props) {
  return (
    // @ts-expect-error TS(2322): Type '{ height: string; display: string; flexDirec... Remove this comment to see the full error message
    <PageWrapper css={props.usesFullHeight ? styles.useFullHeightLayout : styles.wrapper}>
      {/* @ts-expect-error TS(2322): Type '{ css: { flexShrink: number; }; }' is not as... Remove this comment to see the full error message */}
      <Spacer css={styles.fixedSpacer} />
      {props.usesFullHeight ? props.children : <div {...props} css={styles.container} />}
    </PageWrapper>
  );
}

PageContainer.defaultProps = {
  usesFullHeight: false,
};

const styles = {
  useFullHeightLayout: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '&:last-child': {
      flexGrow: 1,
    },
  },
  wrapper: { flex: 1 },
  fixedSpacer: {
    // Ensure spacer's fixed height regardless of flex
    flexShrink: 0,
  },
  container: {
    width: '100%',
    flexGrow: 1,
    paddingBottom: 24,
  },
};
