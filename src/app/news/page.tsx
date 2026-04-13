"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/daily"); }, [router]);
  return null;
}
