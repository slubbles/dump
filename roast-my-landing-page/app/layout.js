import './globals.css';

export const metadata = {
  title: 'Roast My Landing Page — AI-Powered Conversion Teardown',
  description: 'Get a brutally honest, AI-powered analysis of your landing page. Find conversion killers, get actionable fixes, and boost your conversion rate. Instant results.',
  keywords: 'landing page, conversion rate optimization, CRO, A/B testing, roast, analysis, review',
  openGraph: {
    title: 'Roast My Landing Page 🔥',
    description: 'Get your landing page brutally roasted by AI. Find conversion killers in 30 seconds.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roast My Landing Page 🔥',
    description: 'Your landing page is killing conversions. Let AI roast it and tell you why.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
