import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import QueryProvider from '../context/QueryProvider';

export const metadata = {
  title: 'Soft Skill Analyser – KIET Group of Institutions | Communication & Personality Development Tool',
  description: 'Soft Skill Analyser is the official smart communication and personality development tool built for KIET Group of Institutions (Deemed to be University), Ghaziabad. Evaluate students on communication, leadership, teamwork, confidence, presentation skills, and professional behaviour through structured semester-wise activities and reports.',
  keywords: 'kiet soft skill, kiet soft skill analyser, kiet soft skill analyzer, kiet soft skills portal, kiet soft skill evaluation, soft skill analyser kiet, soft skill kiet, softskill-analyser.vercel.app, kiet college soft skills, soft skill analyser, KIET, KIET Group of Institutions, KIET deemed to university, KIET Ghaziabad, communication skills, soft skills assessment, personality development, student evaluation, leadership training, teamwork assessment, confidence building, presentation skills, professional behaviour, semester report, college soft skill tool, Balah, Ghaziabad, soft skill analyzer, KIET university, communication analyser',
  authors: [{ name: 'KIET Group of Institutions' }],
  alternates: {
    canonical: 'https://softskill-analyser.vercel.app/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    url: 'https://softskill-analyser.vercel.app/',
    title: 'Soft Skill Analyser – KIET Group of Institutions | Communication & Personality Development',
    description: 'The official platform for KIET Group of Institutions (Deemed to be University), Ghaziabad to evaluate student soft skills – communication, leadership, teamwork, confidence, and professional behaviour through structured semester-wise reports.',
    images: [
      {
        url: 'https://softskill-analyser.vercel.app/logo.svg',
        alt: 'Soft Skill Analyser Logo – KIET Communication Assessment Tool',
      },
    ],
    siteName: 'Soft Skill Analyser',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Soft Skill Analyser – KIET Group of Institutions | Communication & Personality Development',
    description: 'Evaluate student soft skills at KIET – communication, leadership, teamwork, confidence, and professional behaviour through smart semester-wise reports.',
    images: ['https://softskill-analyser.vercel.app/logo.svg'],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Soft Skill Analyser – KIET Group of Institutions",
  "url": "https://softskill-analyser.vercel.app/",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "All",
  "browserRequirements": "Requires JavaScript. Requires HTML5.",
  "description": "Soft Skill Analyser is the official communication and personality development tool of KIET Group of Institutions (Deemed to be University), Ghaziabad. It evaluates students on communication, leadership, teamwork, confidence, presentation skills, and professional behaviour.",
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
    <html lang="en" dir="ltr">
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
      <body>
        <AuthProvider>
          <QueryProvider>
            <div id="root" className="min-h-screen">
              {children}
            </div>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
