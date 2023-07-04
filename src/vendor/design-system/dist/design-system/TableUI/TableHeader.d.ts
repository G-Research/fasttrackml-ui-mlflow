import type { CSSProperties } from 'react';
import React from 'react';
import type { HTMLDataAttributes } from '../types';
export interface TableHeaderProps extends HTMLDataAttributes {
    /** Enables single-line ellipsis truncation */
    ellipsis?: boolean;
    /** Is this column sortable? */
    sortable?: boolean;
    /** The current sort direction for this column */
    sortDirection?: 'asc' | 'desc' | 'none';
    /** Callback for when the user requests to toggle `sortDirection` */
    onToggleSort?: (event: unknown) => void;
    /** Style property */
    style?: CSSProperties;
    /** Class name property */
    className?: string;
    /** Child nodes for the table header */
    children?: React.ReactNode | React.ReactNode[];
    /** Whether the table header should include a resize handler */
    resizable?: boolean;
    /** Event handler to be passed down to <TableHeaderResizeHandle /> */
    resizeHandler?: React.PointerEventHandler<HTMLDivElement>;
    /** Whether the header is currently being resized */
    isResizing?: boolean;
    /** How to horizontally align the cell contents */
    align?: 'left' | 'center' | 'right';
}
export declare const TableHeader: React.ForwardRefExoticComponent<TableHeaderProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=TableHeader.d.ts.map