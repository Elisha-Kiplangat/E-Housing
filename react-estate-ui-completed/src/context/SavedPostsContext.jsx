import { createContext, useContext, useEffect, useState } from "react";
import apiRequest from "../lib/apiRequest"; 
import { AuthContext } from "./AuthContext"; 
// import { useNavigate } from "react-router-dom";

const SavedPostsContext = createContext();


export const useSavedPosts = () => {
  return useContext(SavedPostsContext);
};

export const SavedPostsProvider = ({ children }) => {
  const [savedPosts, setSavedPosts] = useState(new Set());
  const { currentUser } = useContext(AuthContext); 
//   const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!currentUser) return; 

      try {
        const response = await apiRequest.get("/users/saved");
        const savedIds = new Set(response.data.map((post) => post.id));
        setSavedPosts(savedIds);
      } catch (err) {
        console.error("Error fetching saved posts:", err);
      }
    };

    fetchSavedPosts();
  }, [currentUser]);

  const toggleSave = async (postId) => {
    
    if (!currentUser) {
        // navigate("/login");
      alert("Please log in to save properties.");
      return;
    }

    const newSavedPosts = new Set(savedPosts);
    if (savedPosts.has(postId)) {
      newSavedPosts.delete(postId);
    } else {
      newSavedPosts.add(postId);
    }
    setSavedPosts(newSavedPosts);

    try {
      await apiRequest.post("/users/save", { postId });
    } catch (err) {
      console.error("Failed to update saved status:", err);
      setSavedPosts(savedPosts); 
    }
  };

  return (
    <SavedPostsContext.Provider value={{ savedPosts, toggleSave }}>
      {children}
    </SavedPostsContext.Provider>
  );
};
