import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import {
  MdOutlineWavingHand,
  MdWavingHand,
  MdDeleteOutline,
} from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import axios from "axios";
import { useNavigate,useParams } from "react-router-dom";

const CommentItem = ({ comment, activeUser,getStoryComments }) => {
  const navigate = useNavigate();
  console.log("nguoi login: ",activeUser.username);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [likeStatus, setLikeStatus] = useState(false);
  const [au, setAu] = useState("");
  const [story, setStory] = useState({})
  const slug = useParams().slug
  useEffect(() => {
    const getCommentLikeStatus = async () => {
      const comment_id = comment._id;
      try {
        const { data } = await axios.post(
          `/comment/${comment_id}/getCommentLikeStatus`,
          { activeUser },
          {
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        setLikeStatus(data.likeStatus);
      } catch (error) {
        localStorage.removeItem("authToken");
        navigate("/");
      }
    };
    const getDetailStory = async () => {
        try {
            const { data } = await axios.post(`/story/${slug}`, { activeUser })
            setStory(data.data)
            setLikeStatus(data.likeStatus)
            setLikeCount(data.data.likeCount)
            // setStoryLikeUser(data.data.likes)
            // setLoading(false)
            console.log("story", story);
            const story_id = data.data._id;
    
            if (activeUser.readList) {
    
              if (!activeUser.readList.includes(story_id)) {
                // setStoryReadListStatus(false)
              }
              else {
                // setStoryReadListStatus(true)
    
              }
    
            }
    
          }
          catch (error) {
            setStory({})
            navigate("/not-found")
          }
    };
    getDetailStory();
    getCommentLikeStatus();
  }, []);

  const editDate = (createdAt) => {
    const d = new Date(createdAt);
    var datestring =
      d.toLocaleString("eng", { month: "long" }).substring(0, 3) +
      " " +
      d.getDate();
    return datestring;
  };

  const handleCommentLike = async () => {
    console.log("like comment ıtem ın  basıldı ");

    const comment_id = comment._id;

    try {
      const { data } = await axios.post(
        `/comment/${comment_id}/like`,
        { activeUser },
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      setLikeCount(data.data.likeCount);
      setLikeStatus(data.likeStatus);
    } catch (error) {
      localStorage.removeItem("authToken");
      navigate("/");
    }
  };

  const handleDeleteComment = async () => {
    const comment_id = comment._id;
    try {
      await axios.delete(`/comment/${comment_id}`);
      getStoryComments()
    } catch (error) {
      console.log("delete fail");
    }
  };

  return (
    <div className="comment-item">
      <div className="comment-top-block">
        <section>
          <img
            src={`/userPhotos/${comment.author.photo}`}
            alt={comment.author.username}
            width="35"
          />

          <div>
            <span className="comment-author-username">
              {comment.author.username}
            </span>
            <span className="comment-createdAt">
              {editDate(comment.createdAt)}
            </span>
          </div>
        </section>

        <section>
          {activeUser.username === story?.author?.username ? (
            <MdDeleteOutline onClick={() => handleDeleteComment()} />
          ) : null}
        </section>
      </div>

      <div className="comment-content">
        <span dangerouslySetInnerHTML={{ __html: comment.content }}></span>
      </div>

      <div className="comment-bottom-block">
        <div className="commentLike-wrapper">
          <i className="biLike" onClick={() => handleCommentLike()}>
            {likeStatus ? <MdWavingHand /> : <MdOutlineWavingHand />}
          </i>
          <span className="commentlikeCount">{likeCount}</span>
        </div>

        <div className="comment-star">
          {[...Array(5)].map((_, index) => {
            return (
              <FaStar
                key={index}
                className="star"
                size={15}
                color={comment.star > index ? "#0205b1" : "grey"}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
