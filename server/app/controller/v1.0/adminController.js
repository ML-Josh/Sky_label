const SKError = require('~root/server/module/errorHandler/SKError');
const User = require('~server/app/model/user');

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

};

module.exports = adminController;
