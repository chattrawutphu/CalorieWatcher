"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // รีไดเร็คไปที่ dashboard โดยตรง ซึ่ง dashboard จะตรวจสอบ session
    router.replace("/dashboard");
  }, [router]);

  // ไม่แสดงอะไรเพราะหน้านี้จะถูกรีไดเร็คไปทันที
  return null;
}
