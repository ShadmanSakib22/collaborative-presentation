"use client";

import { useEffect } from "react";
import { usePresentationStore } from "@/app/context/usePresentationStore";

interface User {
  id: string;
  name: string;
  role: "creator" | "editor" | "viewer";
}

interface UserListProps {
  presentationId: string;
  users: User[];
}

export default function UserList({ presentationId, users }: UserListProps) {
  const { username } = usePresentationStore();

  // Function to get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "creator":
        return "bg-purple-500";
      case "editor":
        return "bg-blue-500";
      case "viewer":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="p-2 ">
      <ul className="space-y-2">
        {users.map((user, index) => (
          <li
            key={index}
            className={`p-2 rounded-md ${
              username === user.name ? "bg-accent-content" : "bg-base-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="ml-2 font-medium">
                  {user.name}
                  {username === user.name && " (You)"}
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

      {users.length === 0 && (
        <div className="text-center py-4 text-gray-500">No users connected</div>
      )}
    </div>
  );
}
