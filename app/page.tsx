import {AdSlot} from "@/components/AdSlot";
import {FeaturedProperties} from "@/components/FeaturedProperties";
import {Footer} from "@/components/Footer";
import {Hero} from "@/components/Hero";
import {Navbar} from "@/components/Navbar";
import {OwnerCTA} from "@/components/OwnerCTA";
import {PropertyAiAssistant} from "@/components/PropertyAiAssistant";
import {TrustStrip} from "@/components/TrustStrip";

export const dynamic = "force-dynamic";

export default function Home(){
  return <main><Navbar/><Hero/><TrustStrip/><PropertyAiAssistant compact/><AdSlot/><FeaturedProperties/><OwnerCTA/><Footer/></main>;
}
