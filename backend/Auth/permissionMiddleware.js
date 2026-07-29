import { User } from "../models/User.js";

export function requirePermission(moduleName) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Authentication required." });
      }

      const user = await User.findById(req.user.id).lean();
      if (!user) {
        return res.status(401).json({ message: "User not found." });
      }

      if (user.role === "SUPER_ADMIN") {
        return next();
      }

      if (user.role !== "STAFF") {
        return res.status(403).json({ message: "Access denied." });
      }

      const hasPermission = user.permissions && user.permissions[moduleName] === true;
      if (!hasPermission) {
        return res.status(403).json({ message: `Access denied. No permission for ${moduleName}.` });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: "Permission check failed." });
    }
  };
}
