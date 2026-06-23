import './globals.css';
import './design-system.css';
import './ui-premium.css';
import './app-shell.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/components/AuthProvider';
import AppToaster from '@/components/AppToaster';
import FormEnhancer from '@/components/FormEnhancer';

export const metadata = {
  title: 'Engage Now Africa — Project Management',
  description: 'Empowering communities across Africa. Manage NGO projects, track impact, and collaborate with the ENA workspace.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <FormEnhancer />
          </AuthProvider>
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
