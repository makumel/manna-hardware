const crypto = require('crypto');
const { db } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'manna-hardware-secure-secret-key-2026';
const TOKEN_EXPIRY_DAYS = 7;

/**
 * Hash a password using crypto.scryptSync with a cryptographically secure random salt
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

/**
 * Verify a plain password against stored salt and hash using timing-safe comparison
 */
function verifyPassword(password, salt, storedHash) {
  try {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    const hashBuffer = Buffer.from(hash, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');
    if (hashBuffer.length !== storedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(hashBuffer, storedBuffer);
  } catch (err) {
    return false;
  }
}

/**
 * Create a base64url signed token (HMAC-SHA256)
 */
function generateToken(user) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    id: user.id,
    email: user.email,
    fullName: user.full_name || user.fullName,
    phone: user.phone || '',
    exp: Math.floor(Date.now() / 1000) + (TOKEN_EXPIRY_DAYS * 24 * 60 * 60)
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify signed token and return payload if valid and not expired
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  if (signature !== expectedSig) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Express middleware to enforce authentication
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
  let token = null;

  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else {
      token = authHeader.trim();
    }
  }

  if (!token) {
    return res.status(401).json({
      error: 'Account required. Please log in or create an account to proceed.',
      requires_auth: true
    });
  }

  const payload = verifyToken(token);
  if (!payload || !payload.id) {
    return res.status(401).json({
      error: 'Invalid or expired session. Please log in again.',
      requires_auth: true
    });
  }

  // Fetch current user from database
  const user = db.prepare('SELECT id, email, phone, full_name, created_at FROM users WHERE id = ?').get(payload.id);
  if (!user) {
    return res.status(401).json({
      error: 'User account not found or deactivated. Please log in again.',
      requires_auth: true
    });
  }

  req.user = {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    phone: user.phone,
    createdAt: user.created_at
  };

  next();
}

/**
 * Optional authentication middleware: attaches user if token is present and valid
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
  let token = null;

  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else {
      token = authHeader.trim();
    }
  }

  if (token) {
    const payload = verifyToken(token);
    if (payload && payload.id) {
      const user = db.prepare('SELECT id, email, phone, full_name, created_at FROM users WHERE id = ?').get(payload.id);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          phone: user.phone,
          createdAt: user.created_at
        };
      }
    }
  }

  next();
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  requireAuth,
  optionalAuth
};
