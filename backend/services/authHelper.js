import { User } from '../models/User.js';

export async function getLoggedUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const userId = authHeader.replace("Bearer ", "");
  try {
    return await User.findById(userId);
  } catch {
    return null;
  }
}
