"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "togovest-search-alerts";

export function DashboardAlertCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    try {
      const alerts = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setCount(Array.isArray(alerts) ? alerts.length : 0);
    } catch {
      setCount(0);
    }
  }, []);

  return <span>{count}</span>;
}
