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

export const deleteSavedPost = async (req, res) => {
  const postId = req.body.postId || req.params.postId || req.query.postId;
  const tokenUserId = req.userId;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }

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
      res.status(404).json({ message: "Post not found in saved list" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete saved post!" });
  }
};

export const profilePosts = async (req, res) => {
  const tokenUserId = req.userId;
  const userRole = req.userRole;

  try {
    let userPosts = [];
    let savedPosts = [];
    let bookings = [];


    // Fetch saved posts for all users
    const saved = await prisma.savedPost.findMany({
      where: { userId: tokenUserId },
      include: {
        post: true,
      },
    });

    savedPosts = saved.map((item) => item.post);

    if (userRole === "admin") {
      // Fetch posts for admin only
      userPosts = await prisma.post.findMany({
        where: { userId: tokenUserId },
      });

     return res.status(200).json({ userPosts, savedPosts });
    }

    // Fetch bookings for regular users only
    bookings = await prisma.booking.findMany({
      where: { userId: tokenUserId },
      include: {
        post: true, // Include related property details if needed
      },
    });

    // Return bookings and savedPosts for regular users
    return res.status(200).json({ bookings, savedPosts });
  } catch (err) {
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

//total users with posts(have created posts)
export const usersWithPosts = async (req, res) => {
  try {
    const total = await prisma.user.count({
      where: {
        posts: {
          some: {},
        },
      },
    });
    res.status(200).json(total);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get users with posts!" });
  }
}

export const getUserStats = async (req, res) => {
  try {
    // Get current count of all users
    const currentCount = await prisma.user.count();
    
    // Get count from previous period (e.g., last month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const previousMonthUsers = await prisma.user.count({
      where: {
        createdAt: {
          lt: lastMonth
        }
      }
    });
    
    // Calculate new users in the last month
    const newUsers = currentCount - previousMonthUsers;
    
    // Calculate percentage change
    let percentChange = 0;
    if (previousMonthUsers > 0) {
      percentChange = Math.round((newUsers / previousMonthUsers) * 100);
    } else if (currentCount > 0) {
      percentChange = 100; 
    }
    
    res.status(200).json({
      count: currentCount,
      newUsers: newUsers,
      percentChange: percentChange
    });
  } catch (err) {
    console.error("Error in getUserStats:", err);
    res.status(500).json({ message: "Failed to get user statistics!" });
  }
};

export const getLandlordStats = async (req, res) => {
  try {
    // Get current count of all landlords
    const currentCount = await prisma.user.count({
      where: {
        role: "admin"
      }
    });
    
    // Get count from previous period (e.g., last month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const previousMonthLandlords = await prisma.user.count({
      where: {
        role: "admin",
        createdAt: {
          lt: lastMonth
        }
      }
    });
    
    // Calculate new landlords in the last month
    const newLandlords = currentCount - previousMonthLandlords;
    
    // Calculate percentage change
    let percentChange = 0;
    if (previousMonthLandlords > 0) {
      percentChange = Math.round((newLandlords / previousMonthLandlords) * 100);
    } else if (currentCount > 0) {
      percentChange = 100; // If previous count was 0, and now we have landlords, that's a 100% increase
    }
    
    res.status(200).json({
      count: currentCount,
      newLandlords: newLandlords,
      percentChange: percentChange
    });
  } catch (err) {
    console.error("Error in getLandlordStats:", err);
    res.status(500).json({ message: "Failed to get landlord statistics!" });
  }
};