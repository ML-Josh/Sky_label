/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const SKError = require('~root/server/module/errorHandler/SKError');
const Label = require('~root/server/app/model/label');
const Category = require('~server/app/model/category');
const Tag = require('~server/app/model/tag');
const Url = require('~server/app/model/url');
const tagFunction = require('~server/app/function/tag');
const categoryFunction = require('~server/app/function/category');

// Controllers
const labelController = {
  // Create Label
  createLabel: async (req, res, next) => {
    try {
      if (res.locals.__jwtError) throw res.locals.__jwtError;

      const { sky_id } = res.locals.__jwtPayload;

      const {
        title, url, description, image, remarks, categories, tags,
      } = req.body;

      const existingLabel = await Label.findOne({ sky_id, url, deleted: false });
      if (existingLabel) throw new SKError('E001013');

      const existingUrl = await Url.findOne({ url });

      if (existingUrl) {
        existingUrl.likes += 1;
        existingUrl.save();

        const newLabel = new Label({
          title: existingUrl.title,
          url: existingUrl.url,
          description: existingUrl.description,
          image: existingUrl.image,
          remarks: existingUrl.remarks,
          likes: existingUrl.likes,
          sky_id,
        });

        if (tags) await tagFunction.createTags(tags, newLabel, sky_id, Tag);
        await categoryFunction.createCategories(categories, newLabel, sky_id, Category);

        newLabel.save();

        // Update like counts for labels
        await Label.updateMany({ url }, { likes: existingUrl.likes });

        res.json({
          status: 'ok',
          data: {
            newLabel,
          },
        });
      } else {
        const newLabel = new Label({
          title, url, description, image, remarks, likes: 1, sky_id,
        });

        if (tags) await tagFunction.createTags(tags, newLabel, sky_id, Tag);
        await categoryFunction.createCategories(categories, newLabel, sky_id, Category);
        newLabel.save();

        const newUrl = new Url({
          title: newLabel.title,
          url: newLabel.url,
          description: newLabel.description,
          image: newLabel.image,
          remarks: newLabel.remarks,
          likes: newLabel.likes,
        });
        newUrl.save();

        res.json({
          status: 'OK',
          data: {
            newLabel,
            newUrl,
          },
        });
      }
    } catch (e) {
      next(e);
    }
  },
  // Get Label
  getLabel: async (req, res, next) => {
    try {
      const label = await Label.findById(req.params.id).populate('categories', 'title');

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

  // Get Labels
  getRecentLabels: async (req, res, next) => {
    try {
      const labels = await Label.find({ privacy: 'public', deleted: false })
        .sort('-createdAt')
        .populate('categories', 'title');

      res.json({
        status: 'OK',
        data: {
          labels,
        },
      });
    } catch (e) {
      next(e);
    }
  },

  // Get my Labels
  getMyLabels: async (req, res, next) => {
    try {
      if (res.locals.__jwtError) throw res.locals.__jwtError;

      const labels = await Label.find({ sky_id: res.locals.__jwtPayload.sky_id, deleted: false }).populate('categories', 'title').populate('tags', 'title');

      res.json({
        status: 'OK',
        data: {
          labels,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  // Update Label
  updateLabel: async (req, res, next) => {
    try {
      if (res.locals.__jwtError) throw res.locals.__jwtError;

      const {
        title, url, description, image, remarks, tag, privacy, categories,
      } = req.body;

      const label = await Label.findById(req.params.id);

      if (!label) throw new SKError('E001007');
      if (label.sky_id !== res.locals.__jwtPayload.sky_id) throw new SKError('E001001');

      label.title = title;
      label.url = url;
      label.description = description;
      label.image = image;
      label.remarks = remarks;
      label.tag = tag;
      label.privacy = privacy;
      label.category = categories;

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
  // Delete Label
  deleteLabel: async (req, res, next) => {
    try {
      if (res.locals.__jwtError) throw res.locals.__jwtError;
      const { sky_id } = res.locals.__jwtPayload;

      const label = await Label.findById(req.params.id);

      if (!label) throw new SKError('E001007');
      if (label.sky_id !== res.locals.__jwtPayload.sky_id) throw new SKError('E001001');

      label.deleted = true;
      label.save();

      await Url.findOneAndUpdate({ url: label.url }, { $inc: { likes: -1 } });
      await Label.updateMany({ url: label.url }, { $inc: { likes: -1 } });
      await Category.updateMany({ labels: label._id, sky_id }, { $pull: { labels: label._id } });
      await Tag.updateMany({ labels: label._id, sky_id }, { $pull: { labels: label._id } });

      res.json({
        status: 'OK',
        msg: 'Label Deleted',
        data: {
          label,
        },
      });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = labelController;
