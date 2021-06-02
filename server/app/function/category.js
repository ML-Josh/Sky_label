const createOrUpdateCategories = async (categories, label, sky_id, Model) => {
  if (!categories) {
    const category = await Model.findOne({ title: 'uncategorized', sky_id });
    if (!category) {
      const uncategorized = new Model({ title: 'uncategorized', sky_id });
      uncategorized.save();
      label.categories.push(uncategorized._id);
    } else {
      category.labels.push(label._id);
      category.save();
      label.categories.push(category._id);
    }
  } else {
    for (const c of categories) {
      const category = await Model.findOne({ title: c, sky_id });
      if (category) {
        category.labels.push(label._id);
        category.save();
        label.categories.push(category._id);
      } else {
        const newCategory = new Model({ title: c, labels: label._id, sky_id });
        newCategory.save();
        label.categories.push(newCategory._id);
      }
    }
  }
};

module.exports = { createOrUpdateCategories };
