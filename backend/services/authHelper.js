import state from '../data/index.js';

export function getLoggedUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const userId = authHeader.replace("Bearer ", "");
  return state.users.find(u => u.id === userId) || null;
}
