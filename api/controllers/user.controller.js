import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get users!" });
  }
};

// export const getUser = async (req, res) => {
//   const id = req.params.id;
//   try {
//     const user = await prisma.user.findUnique({
//       where: { id },
//     });
//     res.status(200).json(user);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Failed to get user!" });
//   }
// };

import { ObjectId } from 'mongodb';

export const getUser = async (req, res) => {
  const id = req.params.id;
  const userId = req.userId;
  const userRole = req.userRole;

  // Validate if the id is a valid MongoDB ObjectID
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  try {
    if (userId === id || userRole === 'admin') {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: "User not found!" });
      }
    } else {
      res.status(403).json({ message: "Not authorized to access this user's data." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get user!" });
  }
};


export const updateUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { password, avatar, ...inputs } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: tokenUserId },
  });

  if (user.id !== tokenUserId && user.role !== "admin") {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  let updatedPassword = null;
  try {
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...inputs,
        ...(updatedPassword && { password: updatedPassword }),
        ...(avatar && { avatar }),
      },
    });

    const { password: userPassword, ...rest } = updatedUser;

    res.status(200).json(rest);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update users!" });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  if (id !== tokenUserId && req.userRole !== "admin") {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete users!" });
  }
};

export const getSavedPosts = async (req, res) => {
  try {
    const tokenUserId = req.userId; 

    const savedPosts = await prisma.savedPost.findMany({
      where: { userId: tokenUserId }, 
      include: {
        post: true, 
      },
    });

    if (!savedPosts || savedPosts.length === 0) {
      return res.status(200).json([]); 
    }

    res.status(200).json(savedPosts.map((saved) => saved.post)); 
  } catch (err) {
    console.error("Error fetching saved posts:", err);
    res.status(500).json({ message: "Failed to get saved posts!" });
  }
};


export const savePost = async (req, res) => {
  const postId = req.body.postId;
  const tokenUserId = req.userId;

  try {
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: tokenUserId,
          postId,
        },
      },
    });

    if (savedPost) {
      await prisma.savedPost.delete({
        where: {
          id: savedPost.id,
        },
      });
      res.status(200).json({ message: "Post removed from saved list" });
    } else {
      await prisma.savedPost.create({
        data: {
          userId: tokenUserId,
          postId,
        },
      });
      res.status(200).json({ message: "Post saved" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete users!" });
  }
};

export const profilePosts = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const userPosts = await prisma.post.findMany({
      where: { userId: tokenUserId },
    });
    const saved = await prisma.savedPost.findMany({
      where: { userId: tokenUserId },
      include: {
        post: true,
      },
    });

    const savedPosts = saved.map((item) => item.post);
    res.status(200).json({ userPosts, savedPosts });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get profile posts!" });
  }
};

export const getNotificationNumber = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const number = await prisma.chat.count({
      where: {
        userIDs: {
          hasSome: [tokenUserId],
        },
        NOT: {
          seenBy: {
            hasSome: [tokenUserId],
          },
        },
      },
    });
    res.status(200).json(number);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get profile posts!" });
  }
};

export const totalUsers = async (req, res) => {
  try {
    const total = await prisma.user.count();
    res.status(200).json( total);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get total users!" });
  }
}