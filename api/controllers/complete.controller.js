// // controllers/payment.controller.js
// import { sendEmail } from "../utils/emailService.js"; // Import email service (assuming it exists)

// export const confirmOrder = async (req, res) => {
//   const { transactionId } = req.body;

//   if (!transactionId) {
//     return res.status(400).json({ success: false, message: "Missing transaction ID" });
//   }

//   try {
//     // Simulate sending email confirmation
//     console.log(`✅ Sending email for Transaction ID: ${transactionId}`);

//     // Call an email service (if available)
//     await sendEmail(transactionId);

//     res.json({ success: true, message: "Email sent successfully!" });
//   } catch (error) {
//     console.error("Error sending email:", error);
//     res.status(500).json({ success: false, message: "Failed to send email." });
//   }
// };
