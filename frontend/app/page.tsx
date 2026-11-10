"use client";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./components/LoginPage";
import CustomerView from "./components/customer/CustomerView";
import AgentView from "./components/agent/AgentView";
import { useState } from "react";

export default function Home() {
  const { user } = useAuth();
  const [, forceUpdate] = useState(0);

  if (!user) return <LoginPage onDone={() => forceUpdate((n) => n + 1)} />;
  if (user.role === "agent") return <AgentView />;
  return <CustomerView />;
}
