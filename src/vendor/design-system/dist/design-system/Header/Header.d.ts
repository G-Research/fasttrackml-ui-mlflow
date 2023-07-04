/// <reference types="react" />
import type { DangerousGeneralProps, HTMLDataAttributes } from '../types';
export interface HeaderProps extends HTMLDataAttributes, DangerousGeneralProps {
    /** The title for this page */
    title: React.ReactNode;
    /** Inline elements to be appended to the end of the title, such as a `Tag` */
    titleAddOns?: React.ReactNode | React.ReactNode[];
    /** A single `<Breadcrumb />` component */
    breadcrumbs?: React.ReactNode;
    /** An array of Dubois `<Button />` components */
    buttons?: React.ReactNode[];
}
export declare const Header: React.FC<HeaderProps>;
//# sourceMappingURL=Header.d.ts.map