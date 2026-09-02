export default function ApplicationLogo({ className = '', ...props }) {
 return (
 <svg
 {...props}
 className={className}
 viewBox="0 0 200 200"
 xmlns="http://www.w3.org/2000/svg"
 fill="currentColor"
 >
 {/* Shield Shape */}
 <path
 d="M100 10 L180 50 L180 110 Q180 160 100 190 Q20 160 20 110 L20 50 Z"
 fill="currentColor"
 opacity="0.15"
 stroke="currentColor"
 strokeWidth="3"
 />
 <path
 d="M100 20 L170 55 L170 108 Q170 152 100 180 Q30 152 30 108 L30 55 Z"
 fill="none"
 stroke="currentColor"
 strokeWidth="2"
 opacity="0.6"
 />

 {/* Star (Pakistan style 5-point) */}
 <polygon
 points="100,45 107,68 132,68 112,82 119,105 100,92 81,105 88,82 68,68 93,68"
 fill="currentColor"
 opacity="0.85"
 />

 {/* Crescent */}
 <path
 d="M85 60 A25 25 0 1 0 85 100 A20 20 0 1 1 85 60"
 fill="currentColor"
 opacity="0.7"
 transform="translate(-18, -5)"
 />

 {/* Open Book */}
 <path
 d="M65 120 L100 112 L135 120 L135 150 L100 142 L65 150 Z"
 fill="currentColor"
 opacity="0.3"
 stroke="currentColor"
 strokeWidth="1.5"
 />
 <line x1="100" y1="112" x2="100" y2="142" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />

 {/* Gear teeth around shield */}
 <path
 d="M100 5 L103 10 L97 10 Z"
 fill="currentColor"
 opacity="0.4"
 />
 <path
 d="M130 15 L128 21 L134 19 Z"
 fill="currentColor"
 opacity="0.4"
 />
 <path
 d="M70 15 L72 21 L66 19 Z"
 fill="currentColor"
 opacity="0.4"
 />

 {/* GTTI Text */}
 <text
 x="100"
 y="168"
 textAnchor="middle"
 fontSize="14"
 fontWeight="800"
 fontFamily="Inter, sans-serif"
 fill="currentColor"
 letterSpacing="3"
 opacity="0.9"
 >
 GTTI
 </text>
 </svg>
 );
}
