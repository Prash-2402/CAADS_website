import { Hero } from "./_components/hero";
import { About } from "./_components/about";
import { Highlights } from "./_components/highlights";
import { Team } from "./_components/team";
import { Contact } from "./_components/contact";

export default function MarketingHome() {
  return (
    <>
      <Hero />
      <About />
      <Highlights />
      <Team />
      <Contact />
    </>
  );
}
