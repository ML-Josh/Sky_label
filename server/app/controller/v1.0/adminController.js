const SKError = require('~root/server/module/errorHandler/SKError');
const User = require('~server/app/model/user');
const Label = require('~server/app/model/label');

const adminController = {
  getUsers: async (req, res, next) => {
    try {
      const { role } = res.locals.__jwtPayload;

      if (role !== 'ADMIN') throw new SKError('E001001');

      const { sort, search } = req.query;

      let _sort = { created_at: -1 };
      if (sort === 'label_count') _sort = { label_count: -1 };

      const condition = {};
      const _search = new RegExp(search, 'i');
      const or = [];

      or.push({ name: _search });
      or.push({ email: _search });

      if (or.length > 0) condition.$or = or;

      const users = await User.find(condition)
        .sort(_sort);

      res.json({
        status: 'OK',
        data: {
          users,
        },
      });
    } catch (e) {
      next(e);
    }
  },

  updateUser: async (req, res, next) => {
    try {
      const { role } = res.locals.__jwtPayload;

      if (role !== 'ADMIN') throw new SKError('E001001');

      const user = await User.findOneAndUpdate({ _id: req.params.id }, { name: req.body.name, email: req.body.email, deactivated: req.body.deactivated }, { new: true });

      res.json({
        status: 'OK',
        data: {
          user,
        },
      });
    } catch (e) {
      next(e);
    }
  },

  getUserLabels: async (req, res, next) => {
    try {
      const { role } = res.locals.__jwtPayload;

      if (role !== 'ADMIN') throw new SKError('E001001');

      const user = await User.findById(req.params.id);
      const userLabels = await Label.find({ sky_id: user.sky_id });

      res.json({
        status: 'OK',
        data: {
          userLabels,
        },
      });
    } catch (e) {
      next(e);
    }
  },

  updateUserLabel: async (req, res, next) => {
    try {
      const { role } = res.locals.__jwtPayload;

      if (role !== 'ADMIN') throw new SKError('E001001');

      const {
        categories, tags, remarks, privacy, isFavorite, read_later, deleted,
      } = req.body;

      const label = await Label.findOneAndUpdate({ _id: req.params.id }, {
        categories, tags, remarks, privacy, isFavorite, read_later, deleted,
      }, { new: true });

      res.json({
        status: 'OK',
        data: {
          label,
        },
      });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = adminController;
