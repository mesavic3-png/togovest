"use client";
import {useEffect} from "react";
export function AdImpressionPing({id}:{id:string}){useEffect(()=>{fetch(`/api/ads/impression?id=${encodeURIComponent(id)}`,{method:"POST",keepalive:true}).catch(()=>{});},[id]);return null;}
