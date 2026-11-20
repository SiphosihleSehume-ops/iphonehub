import Footer from "@/components/Footer";
import Storefront from "@/components/Storefront";
import { listProducts } from "@/lib/store";

// Always read the latest catalogue so merchant changes show up immediately.
export const dynamic = "force-dynamic";

export default async function Home() {
  const products = (await listProducts()).filter((p) => p.active);
  return (
    <>
      <Storefront products={products} />
      <Footer />
    </>
  );
}
