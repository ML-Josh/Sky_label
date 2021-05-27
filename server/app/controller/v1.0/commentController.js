const User = require('~server/app/model/user');
const Label = require('~server/app/model/label');
const Comment = require('~server/app/model/comment');
const SKError = require('~root/server/module/errorHandler/SKError');

const commentController = {
  createComment: async (req, res, next) => {
    try {
      if (res.locals.__jwtError) throw res.locals.__jwtError;

      const user_sky_id = res.locals.__jwtPayload.sky_id;
      const user = await User.findOne({ sky_id: user_sky_id });
      const label = await Label.findOne({ _id: req.params.id });

      if (!label) throw new SKError('E001001');

      const newComment = await new Comment({
        user_sky_id,
        user_name: user.name,
        user_img: user.img,
        context: req.body.context,
        label_id: label._id,
      });
      newComment.save();

      label.comment_ids.push(newComment._id);
      label.save();

      res.json({
        status: 'OK',
        data: {
          label,
          newComment,
        },
      });
    } catch (e) {
      next(e);
    }
  },

  updateComment: async (req, res, next) => {
    try {
      if (res.locals.__jwtError) throw res.locals.__jwtError;

      const user_sky_id = res.locals.__jwtPayload.sky_id;

      const comment = await Comment.findOneAndUpdate({ user_sky_id, _id: req.params.id }, { context: req.body.context }, { new: true });

      if (!comment) throw new SKError('E001007');

      res.json({
        status: 'OK',
        data: {
          comment,
        },
      });
    } catch (e) {
      next(e);
    }
  },

  deleteComment: async (req, res, next) => {
    try {
      if (res.locals.__jwtError) throw res.locals.__jwtError;
      const user_sky_id = res.locals.__jwtPayload.sky_id;

      const label = await Label.findOneAndUpdate({
        user_sky_id,
        comment_ids: req.params.id,
      }, {
        $pull: { comment_ids: req.params.id },
      }, { new: true });

      if (!label) throw new SKError('E001007');

      const comment = await Comment.findOneAndDelete({ user_sky_id, _id: req.params.id });

      if (!comment) throw new SKError('E001007');

      res.json({
        status: 'OK',
        data: {
          comment,
          label,
        },
      });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = commentController;