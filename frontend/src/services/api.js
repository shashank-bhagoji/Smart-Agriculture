import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// Derive the backend base (without /api) for serving static files like images
const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
export const BACKEND_URL = apiBase.replace(/\/api$/, "");

// Build a full URL for an uploaded image path (e.g. "/uploads/image-xxx.jpg")
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http") || imagePath.startsWith("data:")) return imagePath; // already absolute or base64 Data URI
  return `${BACKEND_URL}${imagePath}`;
};

export default API;