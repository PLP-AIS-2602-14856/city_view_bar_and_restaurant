import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/lib/cart/CartContext';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
