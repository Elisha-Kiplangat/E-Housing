import axios from "axios";
const apiRequest = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL1,
  withCredentials: true,
});
export default apiRequest;
