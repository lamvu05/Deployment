const AuthService = require('../services/authService');
const { catchAsync } = require('../utils/catchAsync');

/**
 * Auth Controller — thin layer that delegates to AuthService
 */

/** POST /api/auth/register */
const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  const { user, token } = await AuthService.register({ name, email, password });

  res.status(201).json({
    status: 'success',
    data: { user, token },
  });
});

/** POST /api/auth/login */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await AuthService.login({ email, password });

  res.status(200).json({
    status: 'success',
    data: { user, token },
  });
});

/** GET /api/auth/me — requires authenticate middleware */
const getMe = catchAsync(async (req, res) => {
  const user = await AuthService.getProfile(req.user.id);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

/** POST /api/auth/google */
const googleLogin = catchAsync(async (req, res) => {
  const { idToken } = req.body;
  const { user, token } = await AuthService.googleLogin(idToken);

  res.status(200).json({
    status: 'success',
    data: { user, token },
  });
});

module.exports = { register, login, getMe, googleLogin };
