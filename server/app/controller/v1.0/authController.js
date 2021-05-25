const axios = require('axios');
const cookie = require('~server/module/cookie');
const SKError = require('~server/module/errorHandler/SKError');
const User = require('~server/app/model/user');
const jwt = require('~root/server/module/jwt');
const config = require('~root/server/config');
const Access_token = require('~root/server/app/model/access_token');

const authController = {
  // Login
  login: async (req, res, next) => {
    try {
      // Get access token
      const { access_token } = req.query;
      if (!access_token) throw new SKError('E001001');

      const rs = await axios({
        url: `https://skyid.cc/api/1.0/user/me?access_token=${access_token}`,
      });

      if (rs.data.status !== 'OK') throw new Error(rs.data.msg);
      const { data } = rs.data;
      // Login or create new user with current user info
      let user = await User.findOne({ sky_id: data.sky_id });
      if (!user) {
        user = new User({
          sky_id: data.sky_id,
          name: data.name,
          email: data.email,
        });
        user.save();
      }
      // Generate access token & refresh token
      const _access_token = jwt.sign({
        payload: {
          sky_id: user.sky_id,
        },
        secret: config.JWT_SECRET,
        tokenlife: '1h',
      });
      const refresh_token = jwt.sign({
        payload: {
          sky_id: user.sky_id,
        },
        secret: config.JWT_SECRET,
        tokenlife: '7d',
      });
      // Create new Access token model
      const token = await new Access_token({ access_token: _access_token, refresh_token });
      token.save();

      // Save user access token in cookie
      cookie.setCookie(req, res, '__SKLT', _access_token, { maxAge: 86400000 });

      res.json({
        status: 'OK',
        data: {
          user,
          _access_token,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  // Logout
  logout: async (req, res, next) => {
    try {
      const access_token = res.locals.__jwtAccessToken;

      if (!access_token) throw new SKError('E001001');
      const authorizedToken = await Access_token.findOne({ access_token });
      if (!authorizedToken) throw new SKError('E001001');

      await Access_token.updateMany({ refresh_token: authorizedToken.refresh_token }, { revoked: true });

      cookie.clearCookie(res, '__SKLT');

      res.json({
        status: 'OK',
        msg: 'User logged out',
      });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = authController;
