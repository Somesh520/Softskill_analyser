import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import QueryProvider from '../context/QueryProvider';

export const metadata = {
  title: 'Soft Skill Analyser – KIET Group of Institutions | Communication & Personality Development Tool',
  description: 'Soft Skill Analyser is a smart communication and personality development tool built for KIET Group of Institutions (Deemed to be University), Ghaziabad. Evaluate students on communication, leadership, teamwork, confidence, presentation skills, and professional behaviour through structured semester-wise activities and reports.',
  keywords: 'soft skill analyser, KIET, KIET Group of Institutions, KIET deemed to university, KIET Ghaziabad, communication skills, soft skills assessment, personality development, student evaluation, leadership training, teamwork assessment, confidence building, presentation skills, professional behaviour, semester report, college soft skill tool, Balah, Ghaziabad, soft skill analyzer, KIET university, communication analyser',
  authors: [{ name: 'Soft Skill Analyser – KIET Group of Institutions' }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    url: 'https://softskill-analyser.vercel.app/',
    title: 'Soft Skill Analyser – KIET Group of Institutions | Communication & Personality Development',
    description: 'A smart platform for KIET Group of Institutions (Deemed to be University), Ghaziabad to evaluate student soft skills – communication, leadership, teamwork, confidence, and professional behaviour through structured semester-wise reports.',
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        <meta name="theme-color" content="#000000" />
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
