import prisma from "../lib/prisma.js";

export const getBookings = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: tokenUserId,
      },
      include: {
        post: true,
      },
    });
    res.status(200).json(bookings);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get bookings!" });
  }
};

export const addBooking = async (req, res) => {
    const tokenUserId = req.userId;
    const { postId, startDate, endDate } = req.body;
    
    try {
        const booking = await prisma.booking.create({
        data: {
            userId: tokenUserId,
            postId,
            startDate,
            endDate,
        },
        });
        res.status(201).json(booking);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to add booking!" });
    }
    }

export const bookingCount = async (req, res) => {
 
    try {

        const count = await prisma.booking.count();
        res.status(200).json(count);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to get booking count!" });
    }
    }
