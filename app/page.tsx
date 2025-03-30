"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import { usePresentationStore } from "@/app/context/usePresentationStore";

export default function Home() {
  const [presentations, setPresentations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchPresentations = async () => {
      const querySnapshot = await getDocs(collection(db, "presentations"));
      setPresentations(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    };
    fetchPresentations();
  }, []);

  const createPresentation = async () => {
    const docRef = await addDoc(collection(db, "presentations"), {
      name: `New Presentation`,
      createdAt: new Date(),
      lastEdited: new Date(),
      slides: [
        {
          canvasData: JSON.stringify({ version: "6.6.1", objects: [] }),
        },
      ],
      users: [
        {
          username: "Annon",
          role: "creator",
        },
      ],
    });

    usePresentationStore.getState().setUsername("Annon");
    usePresentationStore.getState().setRole("creator");

    router.push(`/presentation/${docRef.id}`);
  };

  const joinPresentation = async (presentationId: string) => {
    const docRef = doc(db, "presentations", presentationId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return;

    const data = docSnap.data();
    const users = data.users || [];
    const userName = `Annon${users.length + 1}`;

    const newUser = {
      username: userName,
      role: "viewer",
    };

    await updateDoc(docRef, {
      users: [...users, newUser],
    });

    usePresentationStore.getState().setUsername(userName);
    usePresentationStore.getState().setRole("viewer");

    router.push(`/presentation/${presentationId}`);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">Collaborative Presentations</h1>
      <div className="flex gap-4 mt-4">
        <input
          type="text"
          className="input input-bordered"
          placeholder="Search presentations..."
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-accent" onClick={createPresentation}>
          Create Presentation
        </button>
      </div>

      <table className="table table-zebra mt-4">
        <thead>
          <tr>
            <th>ID</th>
            {/* <th>Name</th> */}
            <th>Created Date</th>
            <th>Last Edited</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {presentations
            .filter((p) => p.id.toLowerCase().includes(search.toLowerCase()))
            .map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                {/* <td>{p.name}</td> */}
                <td>
                  {new Date(p.createdAt.seconds * 1000).toLocaleDateString()}
                </td>
                <td>
                  {new Date(p.lastEdited.seconds * 1000).toLocaleDateString()}
                </td>
                <td>
                  <button
                    className="btn bg-accent-content hover:bg-accent"
                    onClick={() => joinPresentation(p.id)}
                  >
                    Join
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
