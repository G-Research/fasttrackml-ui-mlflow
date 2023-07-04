import type { TooltipProps as AntDTooltipProps } from 'antd';
import React from 'react';
import type { HTMLDataAttributes } from '../types';
export interface TooltipProps extends HTMLDataAttributes {
    /**
     * The element with which the tooltip should be associated.
     */
    children: React.ReactNode;
    /**
     * Plain text that will appear within the tooltip. Links and formatted content should not be use. However, we allow
     * any React element to be passed in here, rather than just a string, to allow for i18n formatting components.
     */
    title: React.ReactNode;
    /**
     * Value that determines where the tooltip will be positioned relative to the associated element.
     */
    placement?: AntDTooltipProps['placement'];
    /**
     * Escape hatch to allow passing props directly to the underlying Ant `Tooltip` component.
     */
    dangerouslySetAntdProps?: Partial<AntDTooltipProps>;
    /**
     * ID used to refer to this element in unit tests.
     */
    dataTestId?: string;
    /**
     * Prop that forces the tooltip's arrow to be centered on the target element
     */
    arrowPointAtCenter?: boolean;
}
export declare const Tooltip: React.FC<TooltipProps>;
//# sourceMappingURL=Tooltip.d.ts.map