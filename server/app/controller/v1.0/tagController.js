/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const SKError = require('~root/server/module/errorHandler/SKError');
const Tag = require('~server/app/model/tag');
const Label = require('~server/app/model/label');

const tagController = {
  updateTag: async (req, res, next) => {
    try {
      if (res.locals.__jwtError) throw res.locals.__jwtError;
      const user_sky_id = res.locals.__jwtPayload.sky_id;
      const updatedTag = await Tag.findOneAndUpdate({ _id: req.params.id, user_sky_id }, { title: req.body.title }, { new: true });

      if (!updatedTag) throw new SKError('E001007');

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

      const deletedTag = await Tag.findOneAndDelete({ _id: req.params.id, user_sky_id });

      if (!deletedTag) throw new SKError('E001007');

      const labelIds = deletedTag.labels;

      for (const id of labelIds) {
        await Label.findOneAndUpdate({ _id: id }, { $pull: { tags: deletedTag._id } });
      }

      res.json({
        status: 'OK',
        data: {
          deletedTag,
        },
      });
    } catch (e) {
      next(e);
    }
  },

};

module.exports = tagController;
