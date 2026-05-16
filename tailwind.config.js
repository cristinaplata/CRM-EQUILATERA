/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      colors: {
        brand: {
          blue: "#0057FF",
          violet: "#A200FF",
          green: "#2ECC71",
          cream: "#F4E7D5",
        },
        primary: {
          DEFAULT: "#0057FF",
          hover: "#0044CC",
          muted: "#E8F0FF",
        },
        secondary: {
          DEFAULT: "#A200FF",
          hover: "#8400CC",
        },
        accent: {
          DEFAULT: "#2ECC71",
          warning: "#F59E0B",
        },
        danger: "#EF4444",
        bg: "#F8F9FA",
        surface: {
          DEFAULT: "#FFFFFF",
          alt: "#F4E7D5",
        },
        border: {
          DEFAULT: "#E2E8F0",
          strong: "#CBD5E1",
        },
        text: {
          primary: "#1E293B",
          muted: "#64748B",
          inverse: "#FFFFFF",
        },
        stage: {
          lead: "#94A3B8",
          qualification: "#F59E0B",
          meeting: "#3B82F6",
          sent: "#0057FF",
          negotiation: "#A200FF",
          won: "#2ECC71",
          lost: "#EF4444",
        },
        alert: {
          stale: "#F59E0B",
          "qualification-incomplete": "#FB923C",
        },
        source: {
          linkedin: "#0A66C2",
          "lead-magnet": "#7C3AED",
          referral: "#2ECC71",
          webinar: "#F59E0B",
          "cold-outreach": "#64748B",
          other: "#CBD5E1",
        },
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "24px",
        6: "32px",
        8: "48px",
        10: "64px",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        full: "9999px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
        modal: "0 20px 60px rgba(0,0,0,0.15)",
        hover: "0 4px 12px rgba(0,87,255,0.15)",
      },
      fontSize: {
        h1: ["28px", { lineHeight: "1.2", fontWeight: "700" }],
        h2: ["22px", { lineHeight: "1.3", fontWeight: "600" }],
        h3: ["16px", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        label: ["12px", { lineHeight: "1.4", fontWeight: "500" }],
        caption: ["11px", { lineHeight: "1.3", fontWeight: "400" }],
        button: ["13px", { lineHeight: "1.4", fontWeight: "600" }],
      },
    },
  },
  plugins: [],
}
