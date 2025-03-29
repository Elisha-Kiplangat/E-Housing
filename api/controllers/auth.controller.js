import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import nodemailer from 'nodemailer';

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // HASH THE PASSWORD

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(hashedPassword);

    // CREATE A NEW USER AND SAVE TO DB
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    console.log(newUser);

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create user!" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // CHECK IF THE USER EXISTS

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) return res.status(400).json({ message: "Invalid Credentials!" });

    // CHECK IF THE PASSWORD IS CORRECT

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid Credentials!" });

    // GENERATE COOKIE TOKEN AND SEND TO THE USER

    // res.setHeader("Set-Cookie", "test=" + "myValue").json("success")
    const age = 1000 * 60 * 60 * 24 * 7;

    const token = jwt.sign(
      {
        id: user.id,
        isAdmin: false,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: age }
    );
    const { password: userPassword, ...userInfo } = user;

    res
      .cookie("token", token, {
        // httpOnly: true,
        // secure:true,
        maxAge: age,
      })
      .status(200)
      .json(userInfo);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to login!" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token").status(200).json({ message: "Logout Successful" });
};


// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    
    const { email } = req.body;

    if (!email) {
      console.log("Error: No email provided");
      return res.status(400).json({ message: "Email is required" });
    }

    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(200).json({ message: "If your email is registered, you will receive reset instructions." });
    }

    console.log("User found:", { id: user.id, email: user.email, username: user.username });
    
    // Generate JWT token with 1-hour expiry
    const resetToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        purpose: 'password-reset' 
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );
    
    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Configure email transport
    console.log("Setting up email transport...");
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // Verify SMTP connection configuration
    try {
      await transporter.verify();
    } catch (verifyError) {
      throw verifyError; 
    }

    // Prepare email content
    const mailOptions = {
      from: `"E-Housing" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'E-Housing Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3f51b5;">Reset Your Password</h2>
          <p>Hi ${user.username || user.email},</p>
          <p>We received a request to reset your password. Please click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #3f51b5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request this, you can safely ignore this email and your password will remain unchanged.</p>
          <p>Regards,<br>The E-Housing Team</p>
        </div>
      `
    };

    // Send email
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    } catch (sendError) {
      throw sendError; 
    }

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    
    res.status(500).json({ message: "Failed to send reset email. Please try again." });
  }
};

// Verify Reset Token
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // Check if it's a password reset token
    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ message: "Invalid token purpose" });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Token is valid" });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: "Token has expired" });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: "Invalid token" });
    }
    
    // console.error("Verify token error:", error);
    res.status(500).json({ message: "Failed to verify token" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({ message: "Token has expired" });
      }
      return res.status(400).json({ message: "Invalid token" });
    }

    // Check if it's a password reset token
    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ message: "Invalid token purpose" });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Hash the new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword
      }
    });

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    // console.error("Reset password error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};