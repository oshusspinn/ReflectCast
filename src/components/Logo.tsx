import React from "react";

const LOGO_BASE64 =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjRTZFNkU2IiBzdHJva2Utd2lkdGg9IjYiIGZpbGw9Im5vbmUiPgogIDxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ1Ii8+CiAgPHBhdGggZD0iTTEwIDUwIFEgNTAgMzAsIDkwIDUwIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+";

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
    return (
        <img src={LOGO_BASE64} alt="ReflectCast Logo" className={className} />
    );
};

export default Logo;
