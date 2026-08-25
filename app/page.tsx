import {AdSlot} from "@/components/AdSlot";
import {FeaturedProperties} from "@/components/FeaturedProperties";
import {Footer} from "@/components/Footer";
import {Hero} from "@/components/Hero";
import {Navbar} from "@/components/Navbar";
import {PropertyAiAssistant} from "@/components/PropertyAiAssistant";

export const dynamic = "force-dynamic";

export default function Home(){
  return <main><Navbar/><Hero/><PropertyAiAssistant compact/><AdSlot/><FeaturedProperties/><Footer/></main>;
}
