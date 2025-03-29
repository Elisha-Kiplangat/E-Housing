export const handleDarajaCallback = async (req, res) => {
    try {
      const callbackData = req.body;
  
      console.log("Daraja Callback Received:", JSON.stringify(callbackData, null, 2));
  
      if (!callbackData.Body || !callbackData.Body.stkCallback) {
        return res.status(400).json({ error: "Invalid callback data" });
      }
  
      const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } =
        callbackData.Body.stkCallback;
  
      // Process the response based on ResultCode
      if (ResultCode === 0) {
        // Payment was successful
        const items = CallbackMetadata?.Item || [];
        let mpesaReceipt = "";
        let phoneNumber = "";
        let amount = 0;
  
        items.forEach((item) => {
          if (item.Name === "MpesaReceiptNumber") mpesaReceipt = item.Value;
          if (item.Name === "PhoneNumber") phoneNumber = item.Value;
          if (item.Name === "Amount") amount = item.Value;
        });
  
        console.log("Payment Successful:", { CheckoutRequestID, mpesaReceipt, phoneNumber, amount });
  
        // TODO: Save the payment details to the database
      } else {
        // Payment failed
        console.log("Payment Failed:", { CheckoutRequestID, ResultDesc });
      }
  
      res.status(200).json({ message: "Callback received successfully" });
    } catch (error) {
      console.error("Error handling Daraja callback:", error.message);
      res.status(500).json({ error: "Failed to process callback" });
    }
  };
  