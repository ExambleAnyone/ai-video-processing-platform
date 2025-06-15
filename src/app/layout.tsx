import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Video Processing',
  description: 'Yapay zeka destekli video işleme ve analiz platformu',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container mx-auto py-4">
              <nav className="flex items-center justify-between">
                <a href="/" className="text-xl font-bold">
                  AI Video Processing
                </a>
                <div className="flex items-center space-x-6">
                  <a
                    href="/video-processing"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Video İşleme
                  </a>
                  <a
                    href="/docs"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Dokümantasyon
                  </a>
                </div>
              </nav>
            </div>
          </header>
          <main>{children}</main>
          <footer className="border-t mt-auto">
            <div className="container mx-auto py-4">
              <p className="text-sm text-center text-gray-500">
                © {new Date().getFullYear()} AI Video Processing. Tüm hakları saklıdır.
              </p>
            </div>
          </footer>
        </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
