import React from 'react';

export const Card = ({
  children,
  hoverable = false,
  className = '',
  style = {},
  onClick,
  ...props
}) => {
  return (
    <div
      className={`card ${hoverable ? 'card-hover' : ''} ${className}`}
      style={{
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', style = {} }) => (
  <div className={`card-header ${className}`} style={style}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', style = {} }) => (
  <h4 className={className} style={{ margin: 0, fontWeight: 700, ...style }}>
    {children}
  </h4>
);

export const CardDescription = ({ children, className = '', style = {} }) => (
  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', ...style }}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '', style = {} }) => (
  <div className={`card-body ${className}`} style={style}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', style = {} }) => (
  <div className={`card-footer ${className}`} style={style}>
    {children}
  </div>
);

export default Object.assign(Card, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
});
