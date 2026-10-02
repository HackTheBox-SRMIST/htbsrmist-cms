// @/utils/misc/certificateFonts.js

export const CURATED_FONTS = [
    {
        name: "Open Sans",
        family: "'Open Sans', sans-serif",
        googleFont: "Open+Sans:wght@400;600;700;800",
        category: "Standard Sans",
        description: "Classic clean font, default in Jimp",
    },
    {
        name: "Great Vibes",
        family: "'Great Vibes', cursive",
        googleFont: "Great+Vibes",
        category: "Calligraphy & Script",
        description: "Elegant flowing calligraphy, ideal for certificates",
    },
    {
        name: "Cinzel",
        family: "'Cinzel', serif",
        googleFont: "Cinzel:wght@400;600;700;800",
        category: "Formal Serif",
        description: "Prestigious classical Roman serif",
    },
    {
        name: "Cinzel Decorative",
        family: "'Cinzel Decorative', serif",
        googleFont: "Cinzel+Decorative:wght@400;700",
        category: "Formal Serif",
        description: "Ornate headings with artistic swashes",
    },
    {
        name: "Playfair Display",
        family: "'Playfair Display', serif",
        googleFont: "Playfair+Display:ital,wght@0,400;0,700;1,400",
        category: "Formal Serif",
        description: "Sophisticated editorial serif",
    },
    {
        name: "Alex Brush",
        family: "'Alex Brush', cursive",
        googleFont: "Alex+Brush",
        category: "Calligraphy & Script",
        description: "Smooth, legible signature-style cursive",
    },
    {
        name: "Pinyon Script",
        family: "'Pinyon Script', cursive",
        googleFont: "Pinyon+Script",
        category: "Calligraphy & Script",
        description: "Aristocratic formal script with high contrast",
    },
    {
        name: "Parisienne",
        family: "'Parisienne', cursive",
        googleFont: "Parisienne",
        category: "Calligraphy & Script",
        description: "Casual yet formal vintage French script",
    },
    {
        name: "Dancing Script",
        family: "'Dancing Script', cursive",
        googleFont: "Dancing+Script:wght@400;700",
        category: "Calligraphy & Script",
        description: "Lively, modern calligraphy script",
    },
    {
        name: "Montserrat",
        family: "'Montserrat', sans-serif",
        googleFont: "Montserrat:wght@400;600;700;800",
        category: "Modern Sans",
        description: "Sharp, punchy modern sans-serif",
    },
    {
        name: "Poppins",
        family: "'Poppins', sans-serif",
        googleFont: "Poppins:wght@400;600;700;800",
        category: "Modern Sans",
        description: "Clean geometric sans with friendly rounded touches",
    },
    {
        name: "Oswald",
        family: "'Oswald', sans-serif",
        googleFont: "Oswald:wght@400;600;700",
        category: "Modern Sans",
        description: "Impactful, condensed display font",
    },
    {
        name: "Courier Prime",
        family: "'Courier Prime', monospace",
        googleFont: "Courier+Prime:wght@400;700",
        category: "Monospace / Hacker",
        description: "Authentic monospace typewriter / CTF hacker vibe",
    },
];

/**
 * Dynamically loads a font into the document head using Google Fonts or FontFace API.
 */
export const loadWebFont = async (fontFamily, customUrl = "") => {
    if (typeof window === "undefined") return true;

    try {
        // 1. If it's one of our curated Google Fonts
        const curated = CURATED_FONTS.find(
            (f) => f.name.toLowerCase() === (fontFamily || "").toLowerCase()
        );

        if (curated && curated.googleFont) {
            const linkId = `google-font-${curated.name.replace(/\s+/g, "-").toLowerCase()}`;
            if (!document.getElementById(linkId)) {
                const link = document.createElement("link");
                link.id = linkId;
                link.rel = "stylesheet";
                link.href = `https://fonts.googleapis.com/css2?family=${curated.googleFont}&display=swap`;
                document.head.appendChild(link);
            }
            if (document.fonts) {
                await document.fonts.ready;
            }
            return true;
        }

        // 2. If a custom URL is provided
        if (customUrl) {
            // Check if it's a Google Fonts URL
            if (customUrl.includes("fonts.googleapis.com")) {
                const linkId = `custom-google-font-${encodeURIComponent(fontFamily)}`;
                let link = document.getElementById(linkId);
                if (!link) {
                    link = document.createElement("link");
                    link.id = linkId;
                    link.rel = "stylesheet";
                    link.href = customUrl;
                    document.head.appendChild(link);
                } else {
                    link.href = customUrl;
                }
                if (document.fonts) {
                    await document.fonts.ready;
                }
                return true;
            }

            // Direct binary font (.ttf, .otf, .woff, .woff2), ImageKit URL, or Data URI
            const nameToUse = fontFamily || "CustomFont";
            const cleanUrl = customUrl.trim();

            // Inject @font-face style tag to guarantee both CSS and Canvas 2D engine recognize the font
            const styleId = `font-face-${nameToUse.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
            let styleEl = document.getElementById(styleId);
            if (!styleEl) {
                styleEl = document.createElement("style");
                styleEl.id = styleId;
                document.head.appendChild(styleEl);
            }
            styleEl.textContent = `
                @font-face {
                    font-family: '${nameToUse}';
                    src: url('${cleanUrl}') format('truetype'),
                         url('${cleanUrl}') format('opentype'),
                         url('${cleanUrl}') format('woff2'),
                         url('${cleanUrl}');
                    font-display: swap;
                }
            `;

            if (typeof FontFace !== "undefined") {
                try {
                    const face = new FontFace(nameToUse, `url(${cleanUrl})`);
                    const loadedFace = await face.load();
                    document.fonts.add(loadedFace);
                } catch (e) {
                    console.warn("FontFace constructor fallback, relying on @font-face tag:", e);
                }
            }

            if (document.fonts) {
                await document.fonts.load(`16px "${nameToUse}"`).catch(() => {});
                await document.fonts.ready;
            }
            return true;
        }

        return true;
    } catch (err) {
        console.warn("Failed to dynamically load web font:", err);
        return false;
    }
};

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
