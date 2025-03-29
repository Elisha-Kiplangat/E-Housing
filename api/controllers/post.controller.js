import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const getPosts = async (req, res) => {
  const query = req.query;

  try {
    const posts = await prisma.post.findMany({
      where: {
        city: query.city || undefined,
        type: query.type || undefined,
        property: query.property || undefined,
        bedroom: query.bedroom ? parseInt(query.bedroom) : undefined,
        price: {
          gte: query.minPrice ? parseInt(query.minPrice) : undefined,
          lte: query.maxPrice ? parseInt(query.maxPrice) : undefined,
        },
      },
    });

    return res.status(200).json(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to get posts" });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const token = req.cookies?.token;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (!err) {
          const saved = await prisma.savedPost.findUnique({
            where: {
              userId_postId: {
                postId: id,
                userId: payload.id,
              },
            },
          });

          if (!res.headersSent) {
            return res
              .status(200)
              .json({ ...post, isSaved: saved ? true : false });
          }
        }
      });
      return; // Ensure function exits after calling jwt.verify()
    }

    if (!res.headersSent) {
      return res.status(200).json({ ...post, isSaved: false });
    }
  } catch (err) {
    console.log(err);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Failed to get post" });
    }
  }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
        postDetail: {
          create: body.postDetail,
        },
      },
    });
    return res.status(200).json(newPost);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to create post" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const tokenUserId = req.userId;

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenUserId },
    });

    if (post.userId !== tokenUserId && user.role !== 'admin') {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    await prisma.post.update({
      where: { id },
      data: {
        ...body.postData,
        postDetail: {
          update: body.postDetail,
        },
      },
    });
    return res.status(200).json();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to update posts" });
  }
};

//update both post and postDetail
export const updatePostDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const tokenUserId = req.userId;

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenUserId },
    });

    if (post.userId !== tokenUserId && user.role !== 'admin') {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    await prisma.post.update({
      where: { id },
      data: {
        ...body.postData,
        postDetail: {
          update: body.postDetail,
        },
      },
    });
    return res.status(200).json();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to update posts" });
  }
};


export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId !== tokenUserId && user.role !== 'admin') {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    await prisma.post.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to delete post" });
  }
};

export const deletePostDetail = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { postDetail: true },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenUserId },
    });

    if (post.userId !== tokenUserId && user.role !== 'admin') {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    await prisma.$transaction([
      prisma.postDetail.delete({
        where: { id: post.postDetail.id },
      }),
      prisma.post.delete({
        where: { id },
      }),
    ]);

    return res.status(200).json({ message: "Post and post details deleted" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to delete post and post details" });
  }
};

export const countPosts = async (req, res) => {
  try {
    const count = await prisma.post.count();
    return res.status(200).json(count);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to count posts" });
  }
}

export const getPostStats = async (req, res) => {
  try {
    // Get current count of all posts
    const currentCount = await prisma.post.count();
    
    // Get count from previous period (e.g., last month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const previousMonthPosts = await prisma.post.count({
      where: {
        createdAt: {
          lt: lastMonth
        }
      }
    });
    
    // Calculate new posts in the last month
    const newPosts = currentCount - previousMonthPosts;
    
    // Calculate percentage change
    let percentChange = 0;
    if (previousMonthPosts > 0) {
      percentChange = Math.round((newPosts / previousMonthPosts) * 100);
    } else if (currentCount > 0) {
      percentChange = 100; // If previous count was 0, and now we have posts, that's a 100% increase
    }
    
    res.status(200).json({
      count: currentCount,
      newPosts: newPosts,
      percentChange: percentChange
    });
  } catch (err) {
    console.error("Error in getPostStats:", err);
    res.status(500).json({ message: "Failed to get post statistics!" });
  }
};