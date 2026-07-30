import { Hero } from "./_components/hero";
import { About } from "./_components/about";
import { History } from "./_components/history";
import { Achievements } from "./_components/achievements";
import { OfficeBearers } from "./_components/office-bearers";
import { Contact } from "./_components/contact";

export default function MarketingHome() {
  return (
    <>
      <Hero />
      <About />
      <History />
      <Achievements />
      <OfficeBearers />
      <Contact />
    </>
  );
}
