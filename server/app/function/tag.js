const createOrUpdateTags = async (tags, label, sky_id, Model) => {
  for (const t of tags) {
    const tag = await Model.findOne({ title: t, sky_id });
    if (!tag) {
      const newTag = new Model({
        title: t,
        sky_id,
        labels: label._id,
      });
      newTag.save();
      label.tags.push(newTag._id);
    } else {
      tag.labels.push(label._id);
      tag.save();
      label.tags.push(tag._id);
    }
  }
};

module.exports = { createOrUpdateTags };
