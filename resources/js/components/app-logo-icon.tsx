import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
        >
            <path
                d="M21.1 7.15a3.2 3.2 0 0 1 5.8 0L42.15 39H34.1l-3.25-7.15h-13.7L13.9 39H5.85L21.1 7.15Zm-.95 18.1h7.7L24 16.55l-3.85 8.7Z"
                fill="currentColor"
            />
            <path
                d="M9 39h-4m38 0h-4M24 8V4M17.15 31.85l-2.4 5.3m16.1-5.3 2.4 5.3"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                opacity="0.55"
            />
            <circle cx="24" cy="4" r="2" fill="currentColor" />
            <circle cx="4" cy="39" r="2" fill="currentColor" />
            <circle cx="44" cy="39" r="2" fill="currentColor" />
            <circle cx="24" cy="28.55" r="1.7" fill="currentColor" />
        </svg>
    );
}
