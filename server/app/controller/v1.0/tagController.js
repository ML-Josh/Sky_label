const Label = require('~server/app/model/label');

const tagController = {
  updateTag: async (req, res, next) => {
    try {
      if (res.locals.__jwtError) throw res.locals.__jwtError;
      const user_sky_id = res.locals.__jwtPayload.sky_id;
      const label = await Label.findOne({ 'tags._id': req.params.id, user_sky_id });

      const updatedTag = label.tags.id(req.params.id);
      updatedTag.title = req.body.title;
      label.save();

      res.json({
        status: 'OK',
        data: {
          updatedTag,
        },
      });
    } catch (e) {
      next(e);
    }
  },

  deleteTag: async (req, res, next) => {
    try {
      if (res.locals.__jwtError) throw res.locals.__jwtError;
      const user_sky_id = res.locals.__jwtPayload.sky_id;
      const label = await Label.findOne({ user_sky_id, 'tags._id': req.params.id });
      label.tags.id(req.params.id).remove();
      label.save();
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

module.exports = tagController;
