"use client";

import { useEffect } from "react";
import { doc, onSnapshot, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import { usePresentationStore } from "@/app/context/usePresentationStore";

interface PresentationProps {
  presentationId: string;
}

export default function UserList({ presentationId }: PresentationProps) {
  const { username, users, setUsers } = usePresentationStore();

  useEffect(() => {
    const presentationRef = doc(db, "presentations", presentationId);

    // Real-time user updates
    const unsubscribe = onSnapshot(presentationRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const currentUsers = data.users || [];
        setUsers(currentUsers);
      }
    });

    // Handle user leaving
    const handleUserLeave = async () => {
      if (username && presentationId) {
        try {
          await updateDoc(presentationRef, {
            users: arrayRemove(username),
          });
          console.log(`User "${username}" removed from presentation.`);
        } catch (error) {
          console.error("Error removing user:", error);
        }
      }
    };

    window.addEventListener("beforeunload", handleUserLeave);
    window.addEventListener("unload", handleUserLeave);

    return () => {
      unsubscribe();
      window.removeEventListener("beforeunload", handleUserLeave);
      window.removeEventListener("unload", handleUserLeave);
    };
  }, [presentationId, username, users, setUsers]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "creator":
        return "bg-purple-500";
      case "editor":
        return "bg-blue-500";
      case "viewer":
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="p-2">
      <ul className="space-y-2">
        {Array.isArray(users) &&
          users.map((user) => (
            <li
              key={user.username}
              className={`p-2 rounded-md ${
                username === user.username ? "bg-accent-content" : "bg-base-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="ml-2 font-medium">
                    {user.username}
                    {username === user.username && " (You)"}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full text-white ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {user.role}
                </span>
              </div>
            </li>
          ))}
      </ul>

      {(!users || users.length === 0) && (
        <div className="text-center py-4 text-gray-500">No users connected</div>
      )}
    </div>
  );
}
