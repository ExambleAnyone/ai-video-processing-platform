import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Video İşleme | AI Video Processing',
  description: 'Yapay zeka destekli video işleme ve analiz platformu',
};

export default function VideoProcessingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto py-4">
          <nav className="flex items-center justify-between">
            <h1 className="text-xl font-bold">AI Video Processing</h1>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Ana Sayfa
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
  );
}
