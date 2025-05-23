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

export const createPayment = async (req, res) => {
  const { amount, method, transactionId, bookingId } = req.body;

  // Validate required fields
  if (!amount || !method || !transactionId || !bookingId) {
    return res.status(400).json({
      error:
        "Missing required fields. Please provide amount, method, transactionId, and bookingId.",
    });
  }

  try {
    // Check if booking exists
    const bookingExists = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!bookingExists) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check if transactionId is already used
    const existingPayment = await prisma.payment.findUnique({
      where: { transactionId },
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
          connect: { id: bookingId },
        },
      },
      include: {
        booking: true,
      },
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error("Error creating payment:", error);

    // Provide more specific error messages for common cases
    if (error.code === "P2002") {
      return res.status(409).json({
        error:
          "Unique constraint violation. This booking already has a payment.",
      });
    }

    if (error.code === "P2003") {
      return res.status(404).json({
        error: "Foreign key constraint failed. The booking ID may not exist.",
      });
    }

    res
      .status(500)
      .json({ error: "Failed to create payment", details: error.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { status, transactionId } = req.body;

    const updatedPayment = await prisma.payment.update({
      where: {
        transactionId, // Find the record by transactionId
      },
      data: {
        status,
        transactionId,
      },
    });

    if (!updatedPayment) {
      return res
        .status(404)
        .json({ success: false, error: "Payment not found." });
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated.",
      updatedPayment,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update payment." });
  }
};

export const getPayments = async (req, res) => {
  try {
    // Get all payments first
    const payments = await prisma.payment.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Then enrich with booking data where available
    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        // Only attempt to fetch booking data if bookingId exists
        if (payment.bookingId) {
          try {
            const booking = await prisma.booking.findUnique({
              where: { id: payment.bookingId },
              include: {
                user: {
                  select: {
                    username: true,
                    email: true
                  }
                }
              }
            });
            
            return {
              ...payment,
              booking
            };
          } catch (err) {
            // Return payment without booking data if there's an error
            return payment;
          }
        }
        
        // Return payment as is if no bookingId
        return payment;
      })
    );
    
    res.status(200).json(enrichedPayments);
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

export const mpesaCallback = async (req, res) => {
  try {
    console.log("🔹 M-Pesa Callback received:", JSON.stringify(req.body, null, 2));
    
    // Always respond with 200 OK immediately (M-Pesa expects this)
    // This prevents M-Pesa from retrying the callback
    res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
    
    // Continue processing asynchronously
    processCallback(req.body).catch(error => {
      console.error("❌ Error processing M-Pesa callback:", error);
    });
    
  } catch (error) {
    console.error("❌ M-Pesa callback error:", error);
    // Still return 200 to prevent M-Pesa retries
    res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
  }
};

// Process the callback data asynchronously
const processCallback = async (callbackData) => {
  try {
    // Extract data from callback
    const { Body } = callbackData;
    
    if (!Body || !Body.stkCallback) {
      console.error("❌ Invalid callback format - missing Body.stkCallback");
      return;
    }
    
    const { 
      MerchantRequestID, 
      CheckoutRequestID, 
      ResultCode, 
      ResultDesc,
      CallbackMetadata 
    } = Body.stkCallback;
    
    console.log(`🔹 Processing callback for CheckoutRequestID: ${CheckoutRequestID}`);
    console.log(`🔹 ResultCode: ${ResultCode}, ResultDesc: ${ResultDesc}`);
    
    // Find the booking with this checkout ID
    const booking = await prisma.booking.findFirst({
      where: { checkoutId: CheckoutRequestID }
    });
    
    if (!booking) {
      console.error(`❌ No booking found with checkoutId: ${CheckoutRequestID}`);
      return;
    }
    
    console.log(`🔹 Found booking: ${booking.id}`);
    
    // If payment failed
    if (ResultCode !== 0) {
      console.log(`❌ Payment failed: ${ResultDesc}`);
      
      // Update booking status to CANCELED
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELED" }
      });
      
      console.log(`🔹 Updated booking ${booking.id} status to CANCELED`);
      return;
    }
    
    // Extract payment details from CallbackMetadata
    const paymentDetails = extractPaymentDetails(CallbackMetadata);
    console.log("🔹 Extracted payment details:", paymentDetails);
    
    if (!paymentDetails) {
      console.error("❌ Could not extract payment details from callback");
      return;
    }
    
    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        amount: paymentDetails.amount,
        method: "M-Pesa",
        status: "COMPLETED",
        transactionId: paymentDetails.mpesaReceiptNumber,
        phoneNumber: paymentDetails.phoneNumber?.toString(),
        booking: { connect: { id: booking.id } }
      }
    });
    
    console.log(`✅ Payment created successfully: ${payment.id}`);
    
    // Update booking status to CONFIRMED
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CONFIRMED" }
    });
    
    console.log(`✅ Updated booking ${booking.id} status to CONFIRMED`);
    
  } catch (error) {
    console.error("❌ Error processing callback:", error);
  }
};