import axios from "axios";
import { User, ApiResponse } from "@/types/user";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


export const userAPI = {
  // Get local users
  getLocalUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get("/api/v1/user");
    console.log(response);

    return response.data;
  },

  // Create local user
  createLocalUser: async (data: Omit<User, "id">): Promise<ApiResponse<User>> => {
    const response = await api.post("/api/v1/user", data);
    console.log(response)
    return response.data;
  },
};
