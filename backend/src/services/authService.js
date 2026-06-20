const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const UserModel = require('../models/userModel');
const AppError = require('../utils/AppError');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Auth Service — handles all authentication business logic
 */
const AuthService = {
  /**
   * Register a new user
   */
  register: async ({ name, email, password }) => {
    // Check for existing account
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      throw new AppError('Email already in use', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await UserModel.create({ name, email, password: hashedPassword });

    const token = AuthService._signToken(user.id);
    return { user, token };
  },

  /**
   * Login with email & password
   */
  login: async ({ email, password }) => {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.is_active) {
      throw new AppError('Account is deactivated. Contact support.', 403);
    }

    // Remove password before returning
    const { password: _pw, ...safeUser } = user;
    const token = AuthService._signToken(user.id);
    return { user: safeUser, token };
  },

  /**
   * Login/Register with Google ID Token
   */
  googleLogin: async (idToken) => {
    if (!idToken) {
      throw new AppError('Google ID token is required', 400);
    }

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      throw new AppError('Invalid Google ID token', 401);
    }

    const { email, name, email_verified } = payload;
    if (!email_verified) {
      throw new AppError('Google email is not verified', 401);
    }

    // Check if user exists
    let user = await UserModel.findByEmail(email);

    if (!user) {
      // Register new user since they don't exist
      // Generate a secure random password since it is a NOT NULL field in migrations
      const crypto = require('crypto');
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 12);
      
      user = await UserModel.create({
        name: name || email.split('@')[0],
        email,
        password: hashedPassword,
        role: 'user'
      });
    } else {
      if (!user.is_active) {
        throw new AppError('Account is deactivated. Contact support.', 403);
      }
    }

    // Remove password before returning
    const { password: _pw, ...safeUser } = user;
    const token = AuthService._signToken(user.id);
    return { user: safeUser, token };
  },

  /**
   * Return user profile from JWT payload
   */
  getProfile: async (userId) => {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return user;
  },

  /**
   * Sign a JWT
   * @param {string} id
   * @returns {string}
   */
  _signToken: (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  },
};

module.exports = AuthService;
