"use client";
/*
src: app/components/Presentation.tsx
*/

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";

//import { db } from "@/app/firebase/firebaseConfig";
import { usePresentationStore } from "@/app/context/usePresentationStore";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import UserList from "@/app/components/UserList";

interface PresentationProps {
  presentationId: string;
}

export default function Presentation({ presentationId }: PresentationProps) {
  const { username, role, setRole } = usePresentationStore();

  return (
    <>
      {username ? (
        <div className="flex h-screen">
          {/* Left Panel - Slide List */}
          <div className="w-1/6 bg-base-200">
            <h2 className="font-semibold bg-accent-content p-2 text-center">
              SLIDES
            </h2>
            {/* Slide List */}
          </div>

          {/* Main Slide Editor */}
          <div className="flex-1">
            <Tldraw />
          </div>

          {/* Right Panel - Users List */}
          <div className="w-1/6 bg-base-200">
            <h2 className="font-semibold bg-accent-content p-2 text-center">
              USERS
            </h2>
            <UserList presentationId={presentationId} />
          </div>
        </div>
      ) : (
        redirect("/")
      )}
    </>
  );
}
