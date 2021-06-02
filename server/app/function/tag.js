const createOrUpdateTags = async (tags, label, sky_id, Tag) => {
  for (const t of tags) {
    const tag = await Tag.findOne({ title: t, sky_id });
    if (!tag) {
      const newTag = new Tag({
        title: t,
        sky_id,
        labels: label._id,
      });
      newTag.save();
      label.tags.push(newTag._id);
    } else if (tag.labels.includes(label._id)) {
      tag.save();
    } else {
      tag.labels.push(label._id);
      tag.save();
      label.tags.push(tag._id);
    }
  }
};

module.exports = { createOrUpdateTags };
