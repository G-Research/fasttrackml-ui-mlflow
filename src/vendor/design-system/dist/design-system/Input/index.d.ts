/// <reference types="react" />
export * from './common';
declare const Input: import("react").ForwardRefExoticComponent<import("./common").InputProps & import("react").RefAttributes<import("antd/lib/input/Input").default>> & {
    TextArea: import("react").ForwardRefExoticComponent<import("./common").TextAreaProps & import("react").RefAttributes<import("antd/lib/input/TextArea").TextAreaRef>>;
    Password: import("react").FC<import("./common").PasswordProps>;
    Group: ({ dangerouslySetAntdProps, dangerouslyAppendEmotionCSS, compact, ...props }: import("./common").InputGroupProps) => import("@emotion/react/jsx-runtime").JSX.Element;
};
export { Input };
//# sourceMappingURL=index.d.ts.map