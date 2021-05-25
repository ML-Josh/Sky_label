/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const SKError = require('~root/server/module/errorHandler/SKError');
const Label = require('~root/server/app/model/label');
const Category = require('~server/app/model/category');

const labelController = {
  // Create Label
  createLabel: async (req, res, next) => {
    try {
      if (res.locals.__jwtError) throw res.locals.__jwtError;

      const user_sky_id = res.locals.__jwtPayload.sky_id;

      const {
        title, url, description, image, remarks, categories,
      } = req.body;
      console.log(title);

      const label = new Label({
        title, url, description, image, remarks, user_sky_id,
      });

      if (!categories) {
        const category = await Category.findOne({ title: 'uncategorized', user_sky_id });
        if (!category) {
          const uncategorized = new Category({ title: 'uncategorized', user_sky_id });
          uncategorized.save();
          label.categories.push(uncategorized._id);
        } else {
          category.labels.push(label._id);
          category.save();
          label.categories.push(category._id);
        }
      } else {
        for (const c of categories) {
          const category = await Category.findOne({ title: c, user_sky_id });
          if (category) {
            category.labels.push(label._id);
            category.save();
            label.categories.push(category._id);
          } else {
            const newCategory = new Category({ title: c, labels: label._id, user_sky_id });
            newCategory.save();
            label.categories.push(newCategory._id);
          }
        }
      }

      label.save();

      res.json({
        status: 'ok',
        data: {
          label,
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

      const labels = await Label.find({ user_sky_id: res.locals.__jwtPayload.sky_id });

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
      if (label.user_sky_id !== res.locals.__jwtPayload.sky_id) throw new SKError('E001001');

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

      // const label = await Labels.findOneAndDelete({ _id: req.params.id, user_sky_id: res.locals.__jwtPayload.sky_id });

      // if (!label) throw new SKError('E001007');

      const label = await Label.findById(req.params.id);

      if (!label) throw new SKError('E001007');
      if (label.user_sky_id !== res.locals.__jwtPayload.sky_id) throw new SKError('E001001');

      await label.remove();

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
