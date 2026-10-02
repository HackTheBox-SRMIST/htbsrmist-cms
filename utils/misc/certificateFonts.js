// @/utils/misc/certificateFonts.js

/**
 * Creates a default SVG data URL to serve as a handsome fallback certificate template
 */
export const getSampleCertificateTemplate = (title = "CERTIFICATE OF APPRECIATION") => {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1300" height="900" viewBox="0 0 1300 900">
        <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0b0f17"/>
                <stop offset="50%" stop-color="#111827"/>
                <stop offset="100%" stop-color="#090d14"/>
            </linearGradient>
            <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#9FEF00"/>
                <stop offset="50%" stop-color="#22C55E"/>
                <stop offset="100%" stop-color="#10B981"/>
            </linearGradient>
            <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#F59E0B"/>
                <stop offset="100%" stop-color="#D97706"/>
            </linearGradient>
        </defs>

        <!-- Background -->
        <rect width="1300" height="900" fill="url(#bg)"/>

        <!-- Outer Ornamental Border -->
        <rect x="40" y="40" width="1220" height="820" fill="none" stroke="#1f2937" stroke-width="2"/>
        <rect x="55" y="55" width="1190" height="790" fill="none" stroke="url(#accent)" stroke-width="3" stroke-dasharray="10 5" opacity="0.6"/>
        <rect x="65" y="65" width="1170" height="770" fill="none" stroke="#374151" stroke-width="1"/>

        <!-- Corner Ornaments -->
        <path d="M40 90 L90 40 M40 110 L110 40" stroke="url(#accent)" stroke-width="2" opacity="0.7"/>
        <path d="M1260 90 L1210 40 M1260 110 L1190 40" stroke="url(#accent)" stroke-width="2" opacity="0.7"/>
        <path d="M40 810 L90 860 M40 790 L110 860" stroke="url(#accent)" stroke-width="2" opacity="0.7"/>
        <path d="M1260 810 L1210 860 M1260 790 L1190 860" stroke="url(#accent)" stroke-width="2" opacity="0.7"/>

        <!-- Header HTB Badge -->
        <text x="650" y="160" font-family="'Courier New', monospace" font-size="20" fill="#9FEF00" font-weight="bold" text-anchor="middle" letter-spacing="8">
            HACK THE BOX SRMIST
        </text>

        <!-- Certificate Title -->
        <text x="650" y="230" font-family="'Cinzel', Georgia, serif" font-size="44" fill="#F9FAFB" font-weight="bold" text-anchor="middle" letter-spacing="4">
            ${title}
        </text>

        <!-- Subtitle -->
        <text x="650" y="280" font-family="'Open Sans', sans-serif" font-size="18" fill="#9CA3AF" text-anchor="middle" letter-spacing="3">
            THIS IS PROUDLY PRESENTED TO
        </text>

        <!-- Name line baseline marker -->
        <line x1="320" y1="460" x2="980" y2="460" stroke="#374151" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.5"/>

        <!-- Description text -->
        <text x="650" y="550" font-family="'Open Sans', sans-serif" font-size="18" fill="#9CA3AF" text-anchor="middle" letter-spacing="1">
            for active participation and valuable contributions to the event.
        </text>

        <!-- Footer Signatures -->
        <line x1="240" y1="730" x2="460" y2="730" stroke="#4B5563" stroke-width="1.5"/>
        <text x="350" y="760" font-family="'Open Sans', sans-serif" font-size="15" fill="#9CA3AF" text-anchor="middle">FACULTY COORDINATOR</text>

        <!-- Center Seal -->
        <circle cx="650" cy="715" r="45" fill="none" stroke="url(#accent)" stroke-width="2"/>
        <circle cx="650" cy="715" r="38" fill="none" stroke="#374151" stroke-width="1"/>
        <text x="650" y="722" font-family="'Courier New', monospace" font-size="12" fill="#9FEF00" text-anchor="middle" font-weight="bold">HTB VERIFIED</text>

        <line x1="840" y1="730" x2="1060" y2="730" stroke="#4B5563" stroke-width="1.5"/>
        <text x="950" y="760" font-family="'Open Sans', sans-serif" font-size="15" fill="#9CA3AF" text-anchor="middle">CLUB PRESIDENT</text>
    </svg>
    `.trim();

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
