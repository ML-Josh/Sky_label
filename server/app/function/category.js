const createOrUpdateCategories = async (categories, label, sky_id, Category) => {
  if (!categories) {
    const category = await Category.findOne({ title: 'uncategorized', sky_id });
    if (!category) {
      const uncategorized = new Category({ title: 'uncategorized', sky_id });
      uncategorized.save();
      if (label.categories.length === 0) {
        label.categories.push(uncategorized._id);
        uncategorized.labels.push(label._id);
      }
      if (label.categories.length > 0) {
        return;
      }
    } else if (category && label.categories.includes(category._id)) {
      return;
    } else {
      category.labels.push(label._id);
      category.save();
      label.categories.push(category._id);
    }
  }
  if (categories) {
    for (const c of categories) {
      const category = await Category.findOne({ title: c, sky_id });
      const uncategorized = await Category.findOne({ sky_id, title: 'uncategorized' });

      if (label.categories.includes(uncategorized._id)) {
        label.categories.pop();
        await Category.updateOne({ sky_id, title: 'uncategorized' }, { $pull: { labels: label._id } });
      }

      if (category && !category.labels.includes(label._id)) {
        category.labels.push(label._id);
        category.save();
        label.categories.push(category._id);
      }
      if (!category) {
        const newCategory = new Category({ title: c, labels: label._id, sky_id });
        newCategory.save();
        label.categories.push(newCategory._id);
      }
    }
  }
};

module.exports = { createOrUpdateCategories };
