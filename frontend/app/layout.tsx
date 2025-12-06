import type { Metadata } from 'next';
import './globals.css';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

export const metadata: Metadata = {
  title: 'IntegrityOS - Pipeline Inspection System',
  description: 'Система визуализации и анализа данных обследований трубопроводов',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          <Navbar />
          <div className="main-layout">
            <Sidebar />
            <main className="main-content">
              {children}
            </main>
          </div>
          <footer className="footer">
            <div>IntegrityOS MVP © 2024 | Хакатон проект</div>
          </footer>
        </div>
      </body>
    </html>
  );
}