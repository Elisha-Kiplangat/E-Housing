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

/**
 * Handle M-Pesa callback
 */
export const mpesaCallback = async (req, res) => {
  try {
    console.log("🔹 M-Pesa Callback received:", JSON.stringify(req.body));
    
    // Extract STK callback data
    if (!req.body.Body || !req.body.Body.stkCallback) {
      console.error("❌ Invalid callback format:", req.body);
      return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
    }
    
    const { 
      CheckoutRequestID, 
      ResultCode, 
      ResultDesc, 
      CallbackMetadata 
    } = req.body.Body.stkCallback;
    
    console.log(`🔹 Processing callback for CheckoutRequestID: ${CheckoutRequestID}`);
    console.log(`🔹 ResultCode: ${ResultCode}, ResultDesc: ${ResultDesc}`);
    
    // Find the associated booking
    const booking = await prisma.booking.findFirst({
      where: { checkoutId: CheckoutRequestID }
    });
    
    if (!booking) {
      console.error(`❌ No booking found for CheckoutRequestID: ${CheckoutRequestID}`);
      return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
    }
    
    if (ResultCode === 0) {
      // Payment successful
      if (!CallbackMetadata || !CallbackMetadata.Item || !Array.isArray(CallbackMetadata.Item)) {
        console.error("❌ Missing or invalid CallbackMetadata:", CallbackMetadata);
        return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
      }
      
      // Extract values from Item array
      const amount = CallbackMetadata.Item.find(item => item.Name === "Amount")?.Value || 0;
      const mpesaReceiptNumber = CallbackMetadata.Item.find(item => item.Name === "MpesaReceiptNumber")?.Value || "";
      const transactionDate = CallbackMetadata.Item.find(item => item.Name === "TransactionDate")?.Value || "";
      const phoneNumber = CallbackMetadata.Item.find(item => item.Name === "PhoneNumber")?.Value || "";
      
      console.log(`🔹 Extracted payment details:`, {
        amount,
        mpesaReceiptNumber,
        transactionDate,
        phoneNumber
      });
      
      // Format the transaction date if needed
      let formattedDate;
      if (transactionDate && !isNaN(transactionDate)) {
        const dateStr = transactionDate.toString();
        // Format is YYYYMMDDHHmmss
        try {
          formattedDate = new Date(
            parseInt(dateStr.slice(0, 4)),    // Year
            parseInt(dateStr.slice(4, 6)) - 1, // Month (0-indexed)
            parseInt(dateStr.slice(6, 8)),    // Day
            parseInt(dateStr.slice(8, 10)),   // Hour
            parseInt(dateStr.slice(10, 12)),  // Minute
            parseInt(dateStr.slice(12, 14))   // Second
          );
        } catch (e) {
          console.error("❌ Error formatting transaction date:", e);
          formattedDate = new Date(); // Use current date as fallback
        }
      } else {
        formattedDate = new Date(); // Use current date as fallback
      }
      
      // Create a new payment record
      const payment = await prisma.payment.create({
        data: {
          amount: parseFloat(amount),
          status: "COMPLETED", // Match your enum values
          method: "MPESA",     // Match your enum values
          transactionId: mpesaReceiptNumber,
          booking: {
            connect: {
              id: booking.id
            }
          }
        }
      });
      
      // Update booking status to confirmed
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "CONFIRMED" } // Match your enum values
      });
      
      console.log("✅ Payment created successfully:", payment);
      
    } else {
      // Payment failed
      console.error(`❌ M-Pesa transaction failed: ${ResultDesc}`);
      
      // Create failed payment record with a unique transaction ID
      await prisma.payment.create({
        data: {
          amount: 0, // Unknown amount for failed transactions
          status: "FAILED", // Match your enum values
          method: "MPESA",  // Match your enum values
          transactionId: `FAILED-${CheckoutRequestID}-${Date.now()}`, // Unique ID for failed transaction
          booking: {
            connect: {
              id: booking.id
            }
          }
        }
      });
      
      // Update booking status to cancelled
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED" } // Match your enum values
      });
    }
    
    // Always return success to M-Pesa
    return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
    
  } catch (error) {
    console.error("❌ Error processing M-Pesa callback:", error);
    // Always return success to M-Pesa even when there's an error
    return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
};

/**
 * Check payment status by checkout request ID
 */
export const checkPaymentStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;
    
    if (!checkoutRequestId) {
      return res.status(400).json({ error: "Checkout request ID is required" });
    }
    
    // Find the booking with this checkout ID
    const booking = await prisma.booking.findFirst({
      where: { checkoutId: checkoutRequestId },
      include: {
        payments: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });
    
    if (!booking) {
      return res.status(404).json({ error: "No booking found with this checkout ID" });
    }
    
    // If no payments exist yet
    if (!booking.payments || booking.payments.length === 0) {
      return res.status(200).json({
        checkoutRequestId,
        bookingId: booking.id,
        bookingStatus: booking.status,
        paymentStatus: "PENDING",
        message: "Payment is being processed"
      });
    }
    
    // Get the most recent payment
    const payment = booking.payments[0];
    
    // Return payment status
    return res.status(200).json({
      checkoutRequestId,
      bookingId: booking.id,
      paymentId: payment.id,
      transactionId: payment.transactionId,
      amount: payment.amount,
      status: payment.status,
      bookingStatus: booking.status,
      message: payment.status === "COMPLETED" 
        ? "Payment completed successfully" 
        : "Payment failed or is still processing"
    });
    
  } catch (error) {
    console.error("❌ Error checking payment status:", error);
    return res.status(500).json({ error: "Failed to check payment status" });
  }
};

