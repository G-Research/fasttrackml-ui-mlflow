import type { HTMLAttributes, PropsWithChildren } from 'react';
import React from 'react';
import type { DangerousGeneralProps, HTMLDataAttributes } from '../types';
export interface CardProps extends DangerousGeneralProps, HTMLDataAttributes, HTMLAttributes<HTMLDivElement> {
    /**
     * disable the default hover style effects (border, box-shadow)
     *
     * @default false
     */
    disableHover?: boolean;
    /**
     * Show the card in loading state using a Skeleton
     * Without a given width we will default to 300px
     *
     * @default false
     */
    loading?: boolean;
    /**
     * Custom loading content using Dubois Skeleton components
     *
     * @default undefined
     */
    customLoadingContent?: React.ReactNode;
    /**
     *
     * @default undefined
     */
    onClick?: () => void;
    /**
     * Width of the card, used when displaying a list of cards with matching widths
     *
     * @default fit-content
     */
    width?: string | number;
    /**
     * Add a row of content at the bottom of the card
     * Note this content will stretch to the edge of the card, client will need to provide custom padding as needed
     *
     * @default undefined
     */
    bottomBarContent?: React.ReactNode;
    /**
     * Add a row of content at the top of the card
     * Note this content will stretch to the edge of the card, client will need to provide custom padding as needed
     *
     * @default undefined
     */
    topBarContent?: React.ReactNode;
}
export declare const Card: ({ children, customLoadingContent, dangerouslyAppendEmotionCSS, loading, width, bottomBarContent, topBarContent, disableHover, onClick, ...dataAndAttributes }: PropsWithChildren<CardProps>) => import("@emotion/react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Card.d.ts.map