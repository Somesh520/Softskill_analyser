import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import QueryProvider from '../context/QueryProvider';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../components/ThemeProvider';
import ThemeCustomizer from '../components/common/ThemeCustomizer';

import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata = {
  title: 'Soft Skill Analyser – KIET Group of Institutions',
  description: 'Official communication and personality development platform for KIET Group of Institutions. Track and evaluate student soft skills through semester-wise reports.',
  keywords: 'kiet soft skill, kiet soft skill analyser, kiet soft skill analyzer, kiet soft skills portal, kiet soft skill evaluation, soft skill analyser kiet, soft skill kiet, softskill-analyser.vercel.app, kiet college soft skills, soft skill analyser, KIET, KIET Group of Institutions, KIET deemed to university, KIET Ghaziabad, communication skills, soft skills assessment, personality development, student evaluation, leadership training, teamwork assessment, confidence building, presentation skills, professional behaviour, semester report, college soft skill tool, Balah, Ghaziabad, soft skill analyzer, KIET university, communication analyser',
  authors: [{ name: 'KIET Group of Institutions' }],
  alternates: {
    canonical: 'https://softskill-analyser.vercel.app/' },
  robots: {
    index: true,
    follow: true },
  openGraph: {
    type: 'website',
    url: 'https://softskill-analyser.vercel.app/',
    title: 'Soft Skill Analyser – KIET Group of Institutions',
    description: 'Official communication and personality development platform for KIET Group of Institutions. Track and evaluate student soft skills through semester-wise reports.',
    images: [
      {
        url: 'https://softskill-analyser.vercel.app/logo.svg',
        alt: 'Soft Skill Analyser Logo – KIET Communication Assessment Tool' },
    ],
    siteName: 'Soft Skill Analyser',
    locale: 'en_IN' },
  twitter: {
    card: 'summary_large_image',
    title: 'Soft Skill Analyser – KIET Group of Institutions',
    description: 'Official communication and personality development platform for KIET Group of Institutions. Track and evaluate student soft skills.',
    images: ['https://softskill-analyser.vercel.app/logo.svg'] } };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Soft Skill Analyser – KIET Group of Institutions",
  "url": "https://softskill-analyser.vercel.app/",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "All",
  "browserRequirements": "Requires JavaScript. Requires HTML5.",
  "description": "Official communication and personality development platform for KIET Group of Institutions. Track and evaluate student soft skills through semester-wise reports.",
  "publisher": {
    "@type": "EducationalOrganization",
    "name": "KIET Group of Institutions (Deemed to be University)",
    "url": "https://www.kiet.edu/",
    "logo": "https://softskill-analyser.vercel.app/logo.svg",
    "sameAs": [
      "https://www.facebook.com/kiet.edu/",
      "https://twitter.com/KietGroup",
      "https://www.linkedin.com/school/kiet-group-of-institutions/",
      "https://www.instagram.com/kiet_group/"
    ]
  },
  "audience": {
    "@type": "Audience",
    "audienceType": "Students, Teachers, and Administrators of KIET Group of Institutions"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        
        {/* Local Geo SEO Tags for Ghaziabad / Delhi NCR */}
        <meta name="geo.region" content="IN-UP" />
        <meta name="geo.placename" content="Ghaziabad, Uttar Pradesh" />
        <meta name="geo.position" content="28.7513;77.4958" />
        <meta name="ICBM" content="28.7513, 77.4958" />
        
        <meta name="theme-color" content="#000000" />
        
        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${outfit.className} antialiased bg-background text-foreground transition-colors duration-300`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <QueryProvider>
              <ToastProvider>
                <div id="root" className="min-h-screen flex flex-col">
                  {children}
                  <ThemeCustomizer />
                </div>
              </ToastProvider>
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
