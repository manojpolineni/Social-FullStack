import Post from '../models/Post.js';

//Create Post
export const createPost = async (req, res) => {
      try {
            const { text, caption, title } = req.body;

            const baseUrl = `${req.protocol}://${req.get("host")}`;
            const imageUrl = req.files?.image
              ? `${baseUrl}/postUploads/${req.files.image[0].filename}`
              : "";
            const videoUrl = req.files?.video
              ? `${baseUrl}/postUploads/${req.files.video[0].filename}`
              : "";
            
            const post = new Post({
              user: req.user.id,
              title,
              caption,
              text,
              image: imageUrl,
              video: videoUrl,
            });

            await post.save();

      //      io.emit("newPost", {
      //        post: post,
      //        message: "A new post was created!",
      //      });

            // console.log("🔔 Emitting new post notification...");
            // io.emit("newNotification", {
            //   sender: req.user.id,
            //   type: "newPost",
            //   message: `${req.user.userName} added a new Post: "${title}"`,
            //   postId: post._id,
            // });
            // console.log("✅ Notification emitted successfully!");

            return res.status(201).json({ success: true, post });
      } catch (error) {
            console.error("Post Creation Error:", error);
            console.error(
              "Post Creation Error:",
              JSON.stringify(error, null, 2)
            ); 
            return res
              .status(500)
              .json({ success: false, error: error.message });
      }
}

//Get All Posts
export const getPost = async (req, res) => {
      try {
            const posts = await Post.find()
              .populate("user", "userName profilePic isOnline")
              .populate('likes', 'userName')
              .populate("comments.user", "userName, ProfilePic isOnline")
              .sort({ createdAt: -1 });
            return res.status(200).json(posts);
      } catch (error) {
            return res.status(500).json({ message: error.message });
      }
}

//Get Post by ID
export const getUserPosts = async (req, res) => {
      try {
            const userId  = req.user.id;

            if (!userId) {
                  return res.status(400).json({success:false, message: 'Invalid UserId!'})
            }
            const posts = await Post.find({
              user: userId,
            }).sort({ createdAt: -1 }).populate("user", "userName profilePic ").populate('likes', 'userName');

            return res.status(200).json({ success: true, posts });
      } catch (error) {
            return res.status(500).json({ message: error.message });
      };
}

//Delete Post
export const deletePost = async (req, res) => {
      try {
            const post = await Post.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!post) return res.status(404).json({ message: "Post not found!" });
        return res.status(200).json({ message: "Post deleted successfully" });
      } catch (error) {
            return res.status(500).json({ message: error.message });
      }
}

//Like Post
export const likePost = async (req, res) => {
      try {
            const post = await Post.findById(req.params.id);
            if (!post) return res.status(404).json({ message: "Post not found!" });

            if (post.user.toString() === req.user.id) {
                  return res.status(400).json({ success: false, message: 'You cannot like your own post' });
            }
            
            if(post.likes.includes(req.user.id)) {
                  return res.status(400).json({ message: "You have already liked this post" });
            }
            if (!post.likes.includes(req.user.id)) {
                  post.likes.push(req.user.id);
            } else {
                  post.likes = post.likes.filter((id) => id.toString() !== req.user.id);
            }
            await post.save();

            io.emit("newNotification", {
              sender: req.user.id,
              type: "likePost",
              message: `${req.user.userName} liked your post`,
              postId: post._id,
            });

            res.json({ message: "Post liked", likes: post.likes.length });
      } catch (error) {
            return res.status(500).json({ message: error.message });
      }
}

//comment on Post
export const commentOnPost = async (req, res) => { 
      try {
            const post = await Post.findById(req.params.id).populate(
              "user",
              "userName"
            );
            if (!post) return res.status(404).json({ message: "Post not found!" });

            const userComment = {
              text: req.body.text,
              user: req.user.id,
              createdAt: new Date(),
            };
            post.comments.push(userComment);
            await post.save();


            const updatedPost = await Post.findById(req.params.id).populate(
              "comments.user",
              "userName"
            );

            const savedComment = updatedPost.comments[post.comments.length - 1];

            // io.emit("newNotification", {
            //   sender: req.user.id,
            //   type: "newComment",
            //   message: `${req.user.userName} commented on your post`,
            //   postId: post._id,
            // });

            return res
              .status(201)
              .json({
                message: "Comment added",
                comment: savedComment,
              });
      } catch (error) {
            return res.status(500).json({ message: error.message });
      }
}

//delete single comment
export const deleteSingleComment = async (req, res) => { 
      try {
            const { postId, commentId } = req.params;
            const userId = req.user.id;
            const post = await Post.findById(postId);
            if (!post) return res.status(404).json({ message: "Post not found!" });
            const comment = post.comments.find((c) => c._id.toString() === commentId);
            if (!comment) return res.status(404).json({ message: "Comment not found!" });
            if (comment.user.toString() !== userId.toString()) {
                  return res.status(401).json({ message: "You can delete only your comment" });
            };
            post.comments = post.comments.filter((c) => c._id.toString() !== commentId);
            await post.save();
            return res.status(200).json({ message: "Comment deleted", post });
      } catch (error) {
            return res.status(500).json({ message: error.message });
      }
}

//delete all comments on a post
export const deleteAllComments = async (req, res) => { 
      try {
            const {postId} = req.params;
            const post = await Post.findById(postId);
            if (!post) return res.status(404).json({ message: "Post not found!" });
            if(post.comments.length === 0) {
                  return res.status(400).json({ message: "No comments to delete" });
            }
            post.comments = [];
            await post.save();
            return res.status(200).json({ message: "All comments on post deleted", post });
      } catch (error) {
            return res.status(500).json({ message: error.message });
      }
}