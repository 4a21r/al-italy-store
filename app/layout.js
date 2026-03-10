import { CartProvider } from '../context/CartContext';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata = {
  title: 'الأيطالي | أزياء فاخرة',
  description: 'اكتشف الأزياء الفاخرة والأنيقة للفرد العصري',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <CartProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1A1A1A',
                color: '#FFFFFF',
                borderRadius: '8px',
              },
              success: {
                iconTheme: {
                  primary: '#93C572',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}

