"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import { usePresentationStore } from "@/app/context/usePresentationStore";

interface PresentationProps {
  presentationId: string;
}

export default function UserList({ presentationId }: PresentationProps) {
  const {
    username,
    users,
    setUsers,
    role: currentUserRole,
  } = usePresentationStore();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

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

  const handleRoleChange = async (newRole: string) => {
    if (!selectedUser || !presentationId) return;

    const presentationRef = doc(db, "presentations", presentationId);
    try {
      const updatedUsers = users.map((user) =>
        user.username === selectedUser ? { ...user, role: newRole } : user
      );

      await updateDoc(presentationRef, { users: updatedUsers });
      setSelectedUser(null); // Clear selection after role change
    } catch (error) {
      console.error("Error updating user role:", error);
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
              } ${currentUserRole === "creator" ? "cursor-pointer" : ""}`}
              onClick={() =>
                currentUserRole === "creator"
                  ? setSelectedUser(user.username)
                  : null
              }
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

      {/* Role assignment options (only visible to creator) */}
      {currentUserRole === "creator" && selectedUser && (
        <div className="mt-4 p-4 bg-base-200 rounded-md">
          <p className="mb-2">Assign role to {selectedUser}:</p>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
              onClick={() => handleRoleChange("creator")}
            >
              Creator
            </button>
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => handleRoleChange("editor")}
            >
              Editor
            </button>
            <button
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={() => handleRoleChange("viewer")}
            >
              Viewer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
