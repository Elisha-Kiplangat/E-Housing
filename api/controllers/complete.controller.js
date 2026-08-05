import axios from "axios";

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
    console.error(
      "Error getting access token:",
      error?.response?.data || error.message
    );
    throw new Error("Failed to get access token");
  }
};

export const checkPaymentStatus = async (req, res) => {
  const { CheckoutRequestID } = req.body;

  if (!CheckoutRequestID) {
    return res.status(400).json({ error: "CheckoutRequestID is required" });
  }

  try {
    // Ensure required env variables are set
    if (!process.env.BUSINESS_SHORTCODE || !process.env.PASSKEY) {
      return res.status(500).json({
        error: "Server configuration error. Missing environment variables.",
      });
    }

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
      CheckoutRequestID,
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query",
      requestBody,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Extract response details
    const { ResponseCode, ResultCode, ResultDesc } = response.data;

    if (ResponseCode === "0" && ResultCode === "0") {
      return res
        .status(200)
        .json({ success: true, message: "Payment successful" });
    } else {
      return res.status(400).json({
        success: false,
        message: ResultDesc || "Payment not successful",
      });
    }
  } catch (error) {
    console.error(
      "Error checking payment status:",
      error?.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to check payment status",
      details: error?.response?.data || error.message,
    });
  }
};
