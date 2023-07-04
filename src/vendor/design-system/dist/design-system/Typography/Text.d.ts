import { Typography as AntDTypography } from 'antd';
import type { ComponentProps } from 'react';
import type { DangerouslySetAntdProps, TypographyColor, HTMLDataAttributes } from '../types';
type AntDTypographyProps = ComponentProps<typeof AntDTypography>;
type AntDTextProps = ComponentProps<typeof AntDTypography['Text']>;
export interface TextProps extends AntDTypographyProps, Pick<AntDTextProps, 'ellipsis' | 'disabled' | 'code' | 'id' | 'title' | 'aria-label'>, HTMLDataAttributes, DangerouslySetAntdProps<AntDTextProps> {
    bold?: boolean;
    hint?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
    withoutMargins?: boolean;
    color?: TypographyColor;
}
export declare function Text(userProps: TextProps): JSX.Element;
export {};
//# sourceMappingURL=Text.d.ts.map