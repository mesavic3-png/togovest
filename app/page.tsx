import {FeaturedProperties} from "@/components/FeaturedProperties";
import {Footer} from "@/components/Footer";
import {Hero} from "@/components/Hero";
import {Navbar} from "@/components/Navbar";
import {OwnerCTA} from "@/components/OwnerCTA";

export const dynamic = "force-dynamic";

export default function Home(){
  return <main><Navbar/><Hero/><FeaturedProperties/><OwnerCTA/><Footer/></main>;
}
