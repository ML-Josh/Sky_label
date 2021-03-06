/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const SKError = require('~root/server/module/errorHandler/SKError');
const Label = require('~root/server/app/model/label');
const Category = require('~server/app/model/category');
const Tag = require('~server/app/model/tag');
const Url = require('~server/app/model/url');
const tagFunction = require('~server/app/function/tag');
const categoryFunction = require('~server/app/function/category');
const urlParser = require('~server/app/function/parser/urlParser');
const pageParser = require('~server/app/function/parser/pageParser');
const User = require('~server/app/model/user');

// Controllers
const labelController = {
  // Create Label
  createLabel: async (req, res, next) => {
    try {
      if (res.locals.__jwtError) throw res.locals.__jwtError;
      if (res.locals.__jwtPayload.deactivated === true) throw new SKError('E001014');

      const { sky_id } = res.locals.__jwtPayload;

      const {
        url, categories, tags, remarks, privacy, isFavorite, read_later,
      } = req.body;

      const urlObj = urlParser(url);

      const existingLabel = await Label.findOne({ sky_id, url_encode: urlObj.url_encode, deleted: false });
      if (existingLabel) throw new SKError('E001013');

      let existingUrl = await Url.findOne({ url_encode: urlObj.url_encode });

      if (!existingUrl) {
        const pageInfo = await pageParser(url);
        const image = (pageInfo.images || [])[0] || {};

        existingUrl = {
          url: urlObj.url,
          url_encode: urlObj.url_encode,
          protocol: urlObj.protocol,
          host: urlObj.host,
          image: image.url,
          image_width: image.width,
          image_height: image.height,
          title: pageInfo.title,
          description: pageInfo.description,
          fav_count: 1,
        };

        const newUrl = new Url(existingUrl);
        newUrl.save();
      } else {
        existingUrl.fav_count += 1;
        existingUrl.save();
        // Update favorite count for user Labels
        await Label.updateMany({ url_encode: urlObj.url_encode, deleted: false }, { fav_count: existingUrl.fav_count }, { new: true });
      }

      const newLabel = new Label({
        sky_id,
        url: urlObj.url,
        url_encode: urlObj.url_encode,
        title: existingUrl.title,
        host: urlObj.host,
        hash: urlObj.hash,
        utm: urlObj.utm,
        remarks,
        description: existingUrl.description,
        image: existingUrl.image,
        image_width: existingUrl.width,
        image_height: existingUrl.height,
        fav_count: existingUrl.fav_count,
        isFavorite,
        privacy,
        read_later,
      });

      await User.findOneAndUpdate({ sky_id }, { $inc: { label_count: 1 } });

      // Create or update tags and categories
      if (tags) await tagFunction.createOrUpdateTags(tags, newLabel, sky_id, Tag);
      await categoryFunction.createOrUpdateCategories(categories, newLabel, sky_id, Category);

      newLabel.save();

      res.json({
        status: 'OK',
        data: {
          newLabel,
        },
      });
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

  // Get my Labels
  getMyLabels: async (req, res, next) => {
    try {
      if (res.locals.__jwtError) throw res.locals.__jwtError;
      if (res.locals.__jwtPayload.deactivated === true) throw new SKError('E001014');
      const { sky_id } = res.locals.__jwtPayload;

      const { sort, search } = req.query; // sort: recent || fav_count || read_later
      let _sort = { isFavorite: -1, createdAt: -1 };
      if (sort === 'fav_count') _sort = { fav_count: -1, createdAt: -1 };

      const condition = { deleted: false, sky_id };

      const _search = new RegExp(search, 'i');

      const or = [];

      const tag = await Tag.findOne({ title: _search, sky_id: res.locals.__jwtPayload.sky_id });
      if (tag) or.push({ tags: tag._id });

      or.push({ title: _search });
      or.push({ url: _search });
      or.push({ description: _search });

      if (or.length > 0) condition.$or = or;

      const labels = await Label.find(condition)
        .sort(_sort)
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
  // Get read later labels
  getMyReadLater: async (req, res, next) => {
    try {
      if (res.locals.__jwtError) throw res.locals.__jwtError;
      if (res.locals.__jwtPayload.deactivated === true) throw new SKError('E001014');

      const { sky_id } = res.locals.__jwtPayload;

      const labels = await Label.find({ sky_id, read_later: true, deleted: false });

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

  // Get labels
  getLabels: async (req, res, next) => {
    try {
      const { sort, search } = req.query; // sort: recent || fav_count
      let _sort = { createdAt: -1 };
      if (sort === 'fav_count') _sort = { fav_count: -1, createdAt: -1 };

      const condition = { privacy: 'public', deleted: false };

      const _search = new RegExp(search, 'i');

      const or = [];

      or.push({ title: _search });
      or.push({ url: _search });
      or.push({ description: _search });

      if (or.length > 0) condition.$or = or;

      const labels = await Label.find(condition)
        .sort(_sort)
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
  // Update Label
  updateLabel: async (req, res, next) => {
    try {
      if (res.locals.__jwtError) throw res.locals.__jwtError;
      if (res.locals.__jwtPayload.deactivated === true) throw new SKError('E001014');
      const { sky_id } = res.locals.__jwtPayload;
      const {
        remarks, tags, privacy, categories, isFavorite, read_later,
      } = req.body;

      const label = await Label.findById(req.params.id);

      if (!label) throw new SKError('E001007');
      if (label.sky_id !== sky_id) throw new SKError('E001001');

      label.remarks = remarks;
      label.privacy = privacy;
      label.isFavorite = isFavorite;
      label.read_later = read_later;

      if (tags) await tagFunction.createOrUpdateTags(tags, label, sky_id, Tag);
      await categoryFunction.createOrUpdateCategories(categories, label, sky_id, Category);
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
      if (res.locals.__jwtPayload.deactivated === true) throw new SKError('E001014');
      const { sky_id } = res.locals.__jwtPayload;

      const label = await Label.findOne({ _id: req.params.id, deleted: false });

      if (!label) throw new SKError('E001007');
      if (label.sky_id !== res.locals.__jwtPayload.sky_id) throw new SKError('E001001');

      label.deleted = true;
      label.save();

      await Url.findOneAndUpdate({ url_encode: label.url_encode }, { $inc: { fav_count: -1 } });
      await Label.updateMany({ url_encode: label.url_encode }, { $inc: { fav_count: -1 }, deleted_at: Date.now() });
      await Category.updateMany({ labels: label._id, sky_id }, { $pull: { labels: label._id } });
      await Tag.updateMany({ labels: label._id, sky_id }, { $pull: { labels: label._id } });

      await User.findOneAndUpdate({ sky_id }, { $inc: { label_count: -1 } });

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

  getMyDeletedLabels: async (req, res, next) => {
    try {
      if (res.locals.__jwtError) throw res.locals.__jwtError;
      if (res.locals.__jwtPayload.deactivated === true) throw new SKError('E001014');

      const { sky_id } = res.locals.__jwtPayload;

      const deletedLabels = await Label.find({ deleted: true, deleted_permanently: false, sky_id });

      res.json({
        status: 'OK',
        data: {
          deletedLabels,
        },
      });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = labelController;
