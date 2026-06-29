import Cursor from "@/components/Cursor";
import Preloader from "@/components/Preloader";
import Nav from "@/components/Nav";
import SmoothScroll from "@/components/SmoothScroll";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Work from "@/components/Work";
import Footer from "@/components/Footer";
import SmokeLayer from "@/components/SmokeLayer";
import { site } from "@/data/site";

export default function Home() {
  return (
    <>
      <SmokeLayer />
      <Preloader />
      <Cursor />
      <Nav />
      <SmoothScroll>
        <main>
          <Hero />
          <Marquee items={site.services} />
          <About />
          <Work />
          <Footer />
        </main>
      </SmoothScroll>
    </>
  );
}
