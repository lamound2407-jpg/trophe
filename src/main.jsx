import React from "react";
import { createRoot } from "react-dom/client";
import TropheApp from "../trophe-nutrition-app.jsx";
import { signIntoTrophe } from "./firebase.js";

// Browser-compatible replacement for the storage system
// used by the original Trophé artifact.
if (!window.storage) {
  window.storage = {
    async get(key) {
      const value = localStorage.getItem(key);

      if (value === null) {
        return null;
      }

      return { value };
    },

    async set(key, value) {
      localStorage.setItem(key, value);

      return { value };
    },
  };
}

async function startTrophe() {
  try {
    const user = await signIntoTrophe();
    console.log("Trophé connected to Firebase:", user.uid);
  } catch (error) {
    console.error("Firebase connection failed:", error);
  }

  const root = document.getElementById("root");
  createRoot(root).render(<TropheApp />);
}

startTrophe();
