const asyncErrorWrapper = require("express-async-handler");
const Story = require("../Models/story");
const Comment = require("../Models/comment");

const addNewCommentToStory = asyncErrorWrapper(async (req, res, next) => {
  const { slug } = req.params;

  const { star, content } = req.body;

  const story = await Story.findOne({ slug: slug });

  const comment = await Comment.create({
    story: story._id,
    content: content,
    author: req.user.id,
    star: star,
  });

  story.comments.push(comment._id);

  story.commentCount = story.comments.length;

  await story.save();

  return res.status(200).json({
    success: true,
    data: comment,
  });
});

const getAllCommentByStory = asyncErrorWrapper(async (req, res, next) => {
  const { slug } = req.params;

  const story = await Story.findOne({ slug: slug });

  const commmentList = await Comment.find({
    story: story._id,
  })
    .populate({
      path: "author",
      select: "username photo",
    })
    .sort("-createdAt");

  return res.status(200).json({
    success: true,
    count: story.commentCount,
    data: commmentList,
  });
});

const commentLike = asyncErrorWrapper(async (req, res, next) => {
  const { activeUser } = req.body;
  const { comment_id } = req.params;

  const comment = await Comment.findById(comment_id);

  if (!comment.likes.includes(activeUser._id)) {
    comment.likes.push(activeUser._id);
    comment.likeCount = comment.likes.length;

    await comment.save();
  } else {
    const index = comment.likes.indexOf(activeUser._id);
    comment.likes.splice(index, 1);
    comment.likeCount = comment.likes.length;
    await comment.save();
  }

  const likeStatus = comment.likes.includes(activeUser._id);

  return res.status(200).json({
    success: true,
    data: comment,
    likeStatus: likeStatus,
  });
});

const getCommentLikeStatus = asyncErrorWrapper(async (req, res, next) => {
  const { activeUser } = req.body;
  const { comment_id } = req.params;

  const comment = await Comment.findById(comment_id);
  const likeStatus = comment.likes.includes(activeUser._id);

  return res.status(200).json({
    success: true,
    likeStatus: likeStatus,
  });
});

const deleteCommentByAuthor = asyncErrorWrapper(async (req, res, next) => {
  const { comment_id } = req.params;
  try {
    // Tìm kiếm bình luận
    const comment = await Comment.findById(comment_id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    await comment.remove();
    const story = await Story.findById(comment.story);
  
    story.comments.pop(comment._id);
  
    story.commentCount = story.comments.length;
  
    await story.save();
    // Trả về kết quả sau khi xóa
    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

module.exports = {
  addNewCommentToStory,
  getAllCommentByStory,
  commentLike,
  getCommentLikeStatus,
  deleteCommentByAuthor,
};
