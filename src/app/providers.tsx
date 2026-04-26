"use client";

import { ThirdwebProvider } from "thirdweb/react";
import { NotificationProvider } from "@/app/context/NotificationContext";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThirdwebProvider>
      <NotificationProvider>{children}</NotificationProvider>
    </ThirdwebProvider>
  );
}
