import prisma from "../lib/prisma.js";

export const getChats = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    // Fetch all chats where the user is part of the chat
    const chats = await prisma.chat.findMany({
      where: {
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
      include: {
        messages: {
          select: {
            id: true,
            text: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // Get the latest message
        },
      },
    });

    if (!chats || chats.length === 0) {
      return res.status(200).json([]); // Return empty array if no chats
    }

    // Extract unique receiver IDs
    const receiverIds = Array.from(
      new Set(
        chats.map((chat) => chat.userIDs.find((id) => id !== tokenUserId))
      )
    ).filter(Boolean); // Remove undefined values

    // Fetch all receivers in one query
    const receivers = await prisma.user.findMany({
      where: {
        id: { in: receiverIds },
      },
      select: {
        id: true,
        username: true,
        avatar: true,
      },
    });

    // Convert receivers array into an object for quick lookup
    const receiverMap = Object.fromEntries(
      receivers.map((user) => [user.id, user])
    );

    // Attach receiver details to each chat
    const updatedChats = chats.map((chat) => ({
      ...chat,
      receiver: receiverMap[chat.userIDs.find((id) => id !== tokenUserId)] || null,
    }));

    res.status(200).json(updatedChats);
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ message: "Failed to get chats!" });
  }
};


export const getChat = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: req.params.id,
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    await prisma.chat.update({
      where: {
        id: req.params.id,
      },
      data: {
        seenBy: {
          push: [tokenUserId],
        },
      },
    });
    res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get chat!" });
  }
};

export const addChat = async (req, res) => {
  const tokenUserId = req.userId;
  const receiverId = req.body.receiverId;

  if (!receiverId) {
    return res.status(400).json({ message: "Receiver ID is required!" });
  }
  try {
    const newChat = await prisma.chat.create({
      data: {
        userIDs: [tokenUserId, receiverId],
      },
    });
    res.status(200).json(newChat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to add chat!" });
  }
};

export const readChat = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const chat = await prisma.chat.update({
      where: {
        id: req.params.id,
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
      data: {
        seenBy: {
          set: [tokenUserId],
        },
      },
    });
    res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to read chat!" });
  }
};
