/*
src: app/presentation/[id]/page.tsx
*/

"use client";
import { useParams } from "next/navigation";
import Presentation from "@/app/components/Presentation";

export default function PresentationPage() {
  const params = useParams();
  const { id } = params;

  if (!id) return <div>Loading...</div>;

  return <Presentation presentationId={id as string} />;
}
