import type { CSSProperties } from 'react';
import React from 'react';
import type { HTMLDataAttributes } from '../types';
export interface TableCellProps extends HTMLDataAttributes {
    /** Enables single-line ellipsis truncation */
    ellipsis?: boolean;
    /** How to horizontally align the cell contents */
    align?: 'left' | 'center' | 'right';
    /** Class name property */
    className?: string;
    /** Style property */
    style?: CSSProperties;
    /** Child nodes for the table cell */
    children?: React.ReactNode | React.ReactNode[];
}
export declare const TableCell: React.ForwardRefExoticComponent<TableCellProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=TableCell.d.ts.map