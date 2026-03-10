import Header from '../components/Header';
import Hero from '../components/Hero';
import ProductCatalog from '../components/ProductCatalog';
import Footer from '../components/Footer';
import Cart from '../components/Cart';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <ProductCatalog />
      <Footer />
      <Cart />
    </main>
  );
}


