const express = require('express');
const commentController = require('~root/server/app/controller/v1.0/commentController');

const router = express.Router();

router.post('/:id', commentController.createComment);
router.put('/:id', commentController.updateComment);
router.delete('/:id', commentController.deleteComment);

module.exports = router;
