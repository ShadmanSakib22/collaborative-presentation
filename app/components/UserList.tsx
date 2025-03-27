"use client";
/*
src: app/components/UserList.tsx
purpose: list of active users in presentation room
*/
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import { usePresentationStore } from "@/app/context/usePresentationStore";

interface UserListProps {
  presentationId: string;
}

export default function UserList({ presentationId }: UserListProps) {
  const [users, setUsers] = useState<any[]>([]);
  const { username, role } = usePresentationStore();

  useEffect(() => {
    const docRef = doc(db, "presentations", presentationId);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setUsers(snapshot.data().users || []);
      }
    });

    return () => unsubscribe();
  }, [presentationId]);

  console.log(username);

  return (
    <div>
      {users.map((user) => (
        <div
          key={user.name}
          className={`p-2 border-b flex justify-between ${
            user.name === username ? "font-bold text-blue-500" : ""
          }`}
        >
          <span>
            {user.name} ({user.role}) {user.name === username && "(You)"}
          </span>
        </div>
      ))}
    </div>
  );
}
