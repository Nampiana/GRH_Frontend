import { useState } from "react";
import TurnoverService from "../../services/turnover/turnoverService";

export default function useTurnover(){
  const [items,setItems]=useState([]); const [loading,setLoading]=useState(false);
  const fetchTop = async (idSociete,n=20)=>{ setLoading(true); try{ const {data}=await TurnoverService.top(idSociete,n); setItems(data);} finally{ setLoading(false);} };
  const refresh  = async (idSociete)=>{ setLoading(true); try{ await TurnoverService.refresh(idSociete); await fetchTop(idSociete,20);} finally{ setLoading(false);} };
  return {items,loading,fetchTop,refresh};
}
