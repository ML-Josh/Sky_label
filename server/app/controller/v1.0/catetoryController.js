/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const SKError = require('~root/server/module/errorHandler/SKError');
const Category = require('~server/app/model/category');
const Label = require('~server/app/model/label');

const categoryController = {
  createCategory: async (req, res, next) => {
    try {
      if (res.locals.__jwtError) throw res.locals.__jwtError;
      if (res.locals.__jwtPayload.deactivated === true) throw new SKError('E001014');

      if (!req.body.title) throw new SKError('E001011');
      const { sky_id } = res.locals.__jwtPayload;
      let existingCategory = await Category.findOne({ title: req.body.title, sky_id });
      if (!existingCategory) {
        existingCategory = new Category({
          title: req.body.title,
          sky_id,
        });
        existingCategory.save();
      }
      res.json({
        status: 'OK',
        existingCategory,
      });
    } catch (e) {
      next(e);
    }
  },

  // Get Categories
  getMyCategories: async (req, res, next) => {
    try {
      if (res.locals.__jwtError) throw res.locals.__jwtError;
      if (res.locals.__jwtPayload.deactivated === true) throw new SKError('E001014');
      const categories = await Category.find({ sky_id: res.locals.__jwtPayload.sky_id }).populate('labels', '_id url title');

      res.json({
        status: 'OK',
        data: {
          categories,
        },
      });
    } catch (e) {
      next(e);
    }
  },

  // Update Category
  updateCategory: async (req, res, next) => {
    try {
      if (res.locals.__jwtError) throw res.locals.__jwtError;
      if (res.locals.__jwtPayload.deactivated === true) throw new SKError('E001014');
      const { sky_id } = res.locals.__jwtPayload;

      if (!req.body.title) throw new SKError('E001011');

      const updatedCategory = await Category.findOneAndUpdate({ sky_id, _id: req.params.id }, { title: req.body.title }, { new: true });

      res.json({
        status: 'OK',
        data: {
          updatedCategory,
        },
      });
    } catch (e) {
      next(e);
    }
  },

  // Delete Category
  deleteCategory: async (req, res, next) => {
    try {
      if (res.locals.__jwtError) throw res.locals.__jwtError;
      if (res.locals.__jwtPayload.deactivated === true) throw new SKError('E001014');
      const { sky_id } = res.locals.__jwtPayload;

      const deletedCategory = await Category.findOneAndDelete({ sky_id, _id: req.params.id });
      if (!deletedCategory) throw new SKError('E001007');

      const labelIds = deletedCategory.labels;

      for (const id of labelIds) {
        const label = await Label.findOneAndUpdate({ _id: id }, { $pull: { categories: deletedCategory._id } }, { returnOriginal: false });

        if (label.categories.length === 0) {
          const uncategorized = await Category.findOne({ sky_id, title: 'uncategorized' });

          if (!uncategorized) {
            const newCategory = new Category({ title: 'uncategorized', sky_id });
            newCategory.labels.push(label._id);
            newCategory.save();
            label.categories.push(newCategory._id);
            label.save();
          } else {
            uncategorized.labels.push(label._id);
            uncategorized.save();
            label.categories.push(uncategorized._id);
            label.save();
          }
        }
      }

      res.json({
        status: 'OK',
        data: {
          deletedCategory,
        },
      });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = categoryController;
