/// <reference types="react" />
import type { SerializedStyles } from '@emotion/react';
import type { ButtonProps as AntDButtonProps } from 'antd';
import type { ComponentTheme } from '../../theme';
import type { DangerouslySetAntdProps, HTMLDataAttributes } from '../types';
export declare const getButtonEmotionStyles: ({ theme, classNamePrefix, loading, withIcon, onlyIcon, isAnchor, enableAnimation, size, type, isFlex, useNewIcons, useFocusPseudoClass, forceIconStyles, }: {
    theme: ComponentTheme;
    classNamePrefix: string;
    loading?: boolean | undefined;
    withIcon?: boolean | undefined;
    onlyIcon?: boolean | undefined;
    isAnchor?: boolean | undefined;
    danger?: boolean | undefined;
    enableAnimation: boolean;
    size: ButtonSize;
    type?: ButtonProps['type'];
    isFlex?: boolean | undefined;
    useNewIcons?: boolean | undefined;
    useFocusPseudoClass?: boolean | undefined;
    forceIconStyles?: boolean | undefined;
}) => SerializedStyles;
export type ButtonSize = 'middle' | 'small';
export interface ButtonProps extends Omit<AntDButtonProps, 'type' | 'ghost' | 'shape' | 'size'>, HTMLDataAttributes, DangerouslySetAntdProps<AntDButtonProps> {
    type?: 'primary' | 'link' | 'tertiary';
    size?: ButtonSize;
    endIcon?: React.ReactNode;
    dangerouslySetForceIconStyles?: boolean;
    dangerouslyUseFocusPseudoClass?: boolean;
}
export declare const Button: import("react").ForwardRefExoticComponent<ButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=Button.d.ts.map