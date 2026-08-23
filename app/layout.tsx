import type {Metadata} from "next";
import {DM_Sans,Manrope} from "next/font/google";
import "./globals.css";
const body=DM_Sans({subsets:["latin"],variable:"--font-body"});
const display=Manrope({subsets:["latin"],variable:"--font-display"});
export const metadata:Metadata={title:"TOGOVEST — L'immobilier togolais, simplement",description:"Trouvez, achetez, louez ou publiez un bien immobilier au Togo."};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="fr"><body className={`${body.variable} ${display.variable}`}>{children}</body></html>}
