const Label = require('~root/server/app/model/label');

const homeController = {
  getHome: async (req, res, next) => {
    try {
      let loggedInUserId = '';

      if (res.locals.__jwtPayload) loggedInUserId = res.locals.__jwtPayload.sky_id;

      const labels = await Label.find({});

      res.json({
        status: 'OK',
        data: {
          loggedInUserId,
          labels,
        },
      });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = homeController;
