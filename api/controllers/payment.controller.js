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
    console.error("Error getting access token:", error);
    throw error;
  }
};

export const payment = async (req, res) => {
  let { phone, amount } = req.body;

  // ✅ Validate the request body to ensure 'phone' and 'amount' exist
  if (!phone || !amount) {
    return res
      .status(400)
      .json({ error: "Phone number and amount are required" });
  }

  // ✅ Ensure phone number is in the correct M-Pesa format (2547XXXXXXXX)
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
      PartyA: phone, // ✅ Corrected phone number
      PartyB: process.env.BUSINESS_SHORTCODE,
      PhoneNumber: phone, // ✅ Corrected phone number
      CallBackURL: process.env.CALLBACK_URL,
      AccountReference: "Husler Fund",
      TransactionDesc: "Hustler-Fund",
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
