import './globals.css';
import Header from './_components/Header';
import Footer from './_components/Footer';
import { AuthProvider } from './_components/AuthProvider';
import FirebaseGuard from './_components/FirebaseGuard';

export const metadata = {
  title: 'Planszland – Sklep z Grami Planszowymi',
  description: 'Przeglądaj, wyszukuj i kupuj gry planszowe',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        <AuthProvider>
          <Header />
          <FirebaseGuard>
            {children}
          </FirebaseGuard>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
