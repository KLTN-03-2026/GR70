// userService.js
import api from "./api";

export const getUserInfo = async (userId) => {
  const res = await api.get(`/users/info/${userId}`);
  return res.data; // { success, data: { id, brand: {...}, ... } }
};