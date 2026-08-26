import type {Metadata} from "next";
import {DM_Sans,Manrope} from "next/font/google";
import {BackButton} from "@/components/back-button";
import "./globals.css";

const body=DM_Sans({subsets:["latin"],variable:"--font-body"});
const display=Manrope({subsets:["latin"],variable:"--font-display"});

export const metadata:Metadata={
  metadataBase:new URL("https://togovest.com"),
  title:{default:"TOGOVEST — Immobilier au Togo",template:"%s | TOGOVEST"},
  description:"Trouvez des maisons, appartements, terrains et locations au Togo. Achetez, louez ou publiez facilement une annonce immobilière sur TOGOVEST.",
  keywords:["immobilier Togo","immobilier Lomé","maison à vendre Togo","appartement à louer Lomé","terrain à vendre Togo","location Togo","TOGOVEST"],
  alternates:{canonical:"/"},
  openGraph:{
    type:"website",
    locale:"fr_TG",
    url:"/",
    siteName:"TOGOVEST",
    title:"TOGOVEST — Immobilier au Togo",
    description:"Trouvez, achetez, louez ou publiez un bien immobilier au Togo."
  },
  twitter:{card:"summary_large_image",title:"TOGOVEST — Immobilier au Togo",description:"Trouvez, achetez, louez ou publiez un bien immobilier au Togo."},
  robots:{index:true,follow:true,googleBot:{index:true,follow:true}},
};

export default function Layout({children}:{children:React.ReactNode}){return <html lang="fr"><body className={`${body.variable} ${display.variable}`}><BackButton />{children}</body></html>}
