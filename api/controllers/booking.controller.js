import prisma from "../lib/prisma.js";

export const getAllBookings = async (req, res) => {
  try {
    const booking = await prisma.booking.findMany();
    res.status(200).json(booking);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get bookings!" });
  }
};
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

// get one booking by id
export const getBooking = async (req, res) => {
  const { id } = req.params;

  try {
    // Get booking with post and user data
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        post: true,
        user: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found!" });
    }

    // Get payment data using checkoutId
    let payment = null;
    if (booking.checkoutId) {
      payment = await prisma.payment.findUnique({
        where: { transactionId: booking.checkoutId },
      });
    }

    // Combine booking and payment data
    const responseData = {
      ...booking,
      payment: payment || null
    };

    res.status(200).json(responseData);
  } catch (err) {
    console.error("Error fetching booking details:", err);
    res.status(500).json({ message: "Failed to get booking details!" });
  }
};

export const addBooking = async (req, res) => {
  const { startDate, endDate, status, type, postId, userId, checkoutId } =
    req.body;

  try {
    const booking = await prisma.booking.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status,
        checkoutId,
        type,
        post: {
          connect: { id: postId }, // Connect to an existing Post using postId
        },
        user: {
          connect: { id: userId }, // Connect to an existing User using userId
        },
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
};

// ...existing code...

export const updateBooking = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status,
      },
    });
    res.status(200).json(booking);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update booking!" });
  }
};

// New controller method specifically for updating booking status
export const updateBookingStatus = async (req, res) => {
  const { bookingId, status } = req.body;

  // Validate required fields
  if (!bookingId || !status) {
    return res.status(400).json({
      success: false,
      message: "Booking ID and status are required",
    });
  }

  // Validate status value
  const validStatuses = ["pending", "completed", "failed", "cancelled", "approved", "rejected"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status value. Must be one of: ${validStatuses.join(", ")}`,
    });
  }

  try {
    // Make sure bookingId is a valid ObjectId
    if (!bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID format",
      });
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: booking
    });
  } catch (err) {
    console.error("Error updating booking status:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to update booking status!",
      error: err.message
    });
  }
};

export const bookingCount = async (req, res) => {
  try {
//     const count = await prisma.booking.count();
//     res.status(200).json(count);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Failed to get booking count!" });
//   }
// };

        const count = await prisma.booking.count();
        res.status(200).json(count);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to get booking count!" });
    }
    }

    export const getBookingStats = async (req, res) => {
      try {
        // Get current count of all bookings
        const currentCount = await prisma.booking.count();
        
        // Get count from previous period (e.g., last month)
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        const previousMonthBookings = await prisma.booking.count({
          where: {
            createdAt: {
              lt: lastMonth
            }
          }
        });
        
        // Calculate new bookings in the last month
        const newBookings = currentCount - previousMonthBookings;
        
        // Calculate percentage change
        let percentChange = 0;
        if (previousMonthBookings > 0) {
          percentChange = Math.round((newBookings / previousMonthBookings) * 100);
        } else if (currentCount > 0) {
          percentChange = 100; 
        }
        
        res.status(200).json({
          count: currentCount,
          newBookings: newBookings,
          percentChange: percentChange
        });
      } catch (err) {
        console.error("Error in getBookingStats:", err);
        res.status(500).json({ message: "Failed to get booking statistics!" });
      }
    };

    export const deleteBooking = async (req, res) => {
      const { id } = req.params;
    
      try {
        // Check if booking exists
        const booking = await prisma.booking.findUnique({
          where: { id },
          include: { payments: true } // Include all associated payments
        });
    
        if (!booking) {
          return res.status(404).json({ message: "Booking not found!" });
        }
    
        // First delete all associated payments using the proper relationship
        if (booking.payments && booking.payments.length > 0) {
          // Delete all payments associated with this booking
          await prisma.payment.deleteMany({
            where: { bookingId: id }
          });
          console.log(`Deleted ${booking.payments.length} payment record(s) for booking ID: ${id}`);
        }
    
        // Alternative lookup for payments if the booking has a checkoutId but no loaded payments
        if (booking.checkoutId && (!booking.payments || booking.payments.length === 0)) {
          try {
            // Find any payment using the checkoutId
            const payment = await prisma.payment.findUnique({
              where: { transactionId: booking.checkoutId }
            });
    
            if (payment) {
              // Delete the payment record
              await prisma.payment.delete({
                where: { id: payment.id }
              });
              console.log(`Deleted payment record with transaction ID: ${booking.checkoutId}`);
            }
          } catch (paymentError) {
            console.error("Error deleting associated payment by checkoutId:", paymentError);
          }
        }
    
        // Now delete the booking
        const deletedBooking = await prisma.booking.delete({
          where: { id }
        });
    
        res.status(200).json({
          success: true,
          message: "Booking and associated payments deleted successfully",
          data: deletedBooking
        });
      } catch (err) {
        console.error("Error deleting booking:", err);
        res.status(500).json({ 
          success: false,
          message: "Failed to delete booking!",
          error: err.message
        });
      }
    };

