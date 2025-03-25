import axios from "axios";
import prisma from "../lib/prisma.js";

const getAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`
  ).toString("base64");
  try {
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting access token:", error);
    throw error;
  }
};

export const payment = async (req, res) => {
  let { phone, amount } = req.body;

  if (!phone || !amount) {
    return res
      .status(400)
      .json({ error: "Phone number and amount are required" });
  }

  if (typeof phone !== "string") {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  if (phone.startsWith("07" || "0")) {
    phone = "254" + phone.substring(1); // Convert 07XXXXXXXX to 2547XXXXXXXX
  } else if (!phone.startsWith("254") || phone.length !== 12) {
    return res.status(400).json({ error: "Invalid Phone Number Format" });
  }

  try {
    const token = await getAccessToken();
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14);
    const password = Buffer.from(
      `${process.env.BUSINESS_SHORTCODE}${process.env.PASSKEY}${timestamp}`
    ).toString("base64");

    const requestBody = {
      BusinessShortCode: process.env.BUSINESS_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: process.env.BUSINESS_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: process.env.CALLBACK_URL,
      AccountReference: "E-Housing",
      TransactionDesc: "E-Housing Payment",
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      requestBody,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("STK Push Error:", error);
    res
      .status(500)
      .json({ error: error.response ? error.response.data : error.message });
  }
};

//CRUD operations
export const createPayment = async (req, res) => {
  const { amount, method, transactionId, bookingId } = req.body;

  // Validate required fields
  if (!amount || !method || !transactionId || !bookingId) {
    return res.status(400).json({ 
      error: "Missing required fields. Please provide amount, method, transactionId, and bookingId." 
    });
  }

  try {
    // Check if booking exists
    const bookingExists = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!bookingExists) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check if transactionId is already used
    const existingPayment = await prisma.payment.findUnique({
      where: { transactionId }
    });

    if (existingPayment) {
      return res.status(409).json({ error: "Transaction ID already exists" });
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        method,
        transactionId,
        status: "pending", // Default status as defined in the model
        booking: {
          connect: { id: bookingId }
        }
      },
      include: {
        booking: true
      }
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error("Error creating payment:", error);
    
    // Provide more specific error messages for common cases
    if (error.code === 'P2002') {
      return res.status(409).json({ error: "Unique constraint violation. This booking already has a payment." });
    }
    
    if (error.code === 'P2003') {
      return res.status(404).json({ error: "Foreign key constraint failed. The booking ID may not exist." });
    }
    
    res.status(500).json({ error: "Failed to create payment", details: error.message });
  }
};

export const getPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        booking: {
          include: {
            user: {
              select: {
                username: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    res.status(200).json(payments);
  } catch (err) {
    console.error("Error getting payment list:", err);
    res.status(500).json({ message: "Failed to get payment list" });
  }
};

export const totalPayments = async (req, res) => {
  try {
    const total = await prisma.payment.aggregate({
      _sum: {
        amount: true
      }
    });
    
    res.json(
      total._sum.amount || 0 
    );
  } catch (error) {
    console.error("Error getting total payments:", error);
    res.status(500).json({ error: "Failed to get total payments" });
  }
};

export const getPaymentStats = async (req, res) => {
  try {
    // Get total payment amount
    const totalResult = await prisma.payment.aggregate({
      _sum: {
        amount: true
      }
    });
    const totalAmount = totalResult._sum.amount || 0;
    
    // Get total from previous month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const previousMonthTotal = await prisma.payment.aggregate({
      _sum: {
        amount: true
      },
      where: {
        createdAt: {
          lt: lastMonth
        }
      }
    });
    const previousAmount = previousMonthTotal._sum.amount || 0;
    
    // Get amount from current month
    const currentMonthTotal = await prisma.payment.aggregate({
      _sum: {
        amount: true
      },
      where: {
        createdAt: {
          gte: lastMonth
        }
      }
    });
    const currentMonthAmount = currentMonthTotal._sum.amount || 0;
    
    // Get weekly data
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const weeklyTotal = await prisma.payment.aggregate({
      _sum: {
        amount: true
      },
      where: {
        createdAt: {
          gte: lastWeek
        }
      }
    });
    const weeklyAmount = weeklyTotal._sum.amount || 0;
    
    // Calculate previous week
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const previousWeekTotal = await prisma.payment.aggregate({
      _sum: {
        amount: true
      },
      where: {
        createdAt: {
          gte: twoWeeksAgo,
          lt: lastWeek
        }
      }
    });
    const previousWeekAmount = previousWeekTotal._sum.amount || 0;
    
    // Calculate percentage changes
    let percentChange = 0;
    if (previousAmount > 0) {
      percentChange = Math.round((currentMonthAmount / previousAmount) * 100) - 100;
    } else if (currentMonthAmount > 0) {
      percentChange = 100;
    }
    
    let weeklyChange = 0;
    if (previousWeekAmount > 0) {
      weeklyChange = Math.round((weeklyAmount / previousWeekAmount) * 100) - 100;
    } else if (weeklyAmount > 0) {
      weeklyChange = 100;
    }
    
    res.status(200).json({
      totalAmount: totalAmount,
      newAmount: currentMonthAmount,
      percentChange: percentChange,
      weeklyAmount: weeklyAmount,
      weeklyChange: weeklyChange
    });
  } catch (err) {
    console.error("Error in getPaymentStats:", err);
    res.status(500).json({ message: "Failed to get payment statistics!" });
  }
};

export const getMonthlyPaymentStats = async (req, res) => {
  try {
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Get all payments for the current year
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear+1}-01-01`)
        }
      },
      select: {
        amount: true,
        createdAt: true
      }
    });
    
    // Group payments by month
    const monthlyStats = {};
    
    // Initialize all months with 0
    for (let i = 1; i <= 12; i++) {
      monthlyStats[i] = 0;
    }
    
    // Sum up payments for each month
    payments.forEach(payment => {
      const month = payment.createdAt.getMonth() + 1; // JavaScript months are 0-indexed
      monthlyStats[month] += payment.amount;
    });
    
    res.status(200).json(monthlyStats);
  } catch (err) {
    console.error("Error getting monthly payment stats:", err);
    res.status(500).json({ message: "Failed to get monthly payment statistics" });
  }
};