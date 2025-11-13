/* eslint-env node */

/**
 * Authentication middleware
 * Verifies user authentication token and attaches user info to request
 */

const authMiddleware = (req, res, next) => {
  // For now, we're using simple password-based auth
  // In production, you should use JWT tokens or session-based auth
  
  // Get token from header
  const token = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-auth-token'];
  
  if (!token) {
    // For development, allow requests without token
    // In production, uncomment the following:
    // return res.status(401).json({ message: 'No authentication token provided' });
    return next();
  }
  
  // TODO: Verify JWT token here
  // For now, we'll just pass through
  // In production, decode and verify the token, then attach user to req.user
  
  next();
};

/**
 * Role-based authorization middleware
 * Checks if user has required role
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    // Get user from request (set by authMiddleware)
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
};

module.exports = {
  authMiddleware,
  requireRole,
};

