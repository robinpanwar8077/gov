import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465, // Zoho SMTP SSL port
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
    try {
        const info = await transporter.sendMail({
            from: `"GovProNet" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log("Email sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
}

export async function sendKYCStatusUpdateEmail(email: string, name: string, status: string, remarks?: string) {
    const subject = `KYC Status Update: ${status}`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px;">
            <h2>Hello ${name},</h2>
            <p>Your KYC verification status has been updated to <strong style="color: ${status === 'APPROVED' ? 'green' : 'red'}">${status}</strong>.</p>
            ${remarks ? `<p><strong>Remarks from Admin:</strong> ${remarks}</p>` : ''}
            <p>Please login to your dashboard for more details and next steps.</p>
            <hr/>
            <p style="font-size: 12px; color: #666;">GovProNet Team</p>
        </div>
    `;
    await sendEmail({ to: email, subject, html });
}

export async function sendAuthRequestUpdateEmail(email: string, vendorName: string, productName: string, status: string, oemName: string, remarks?: string) {
    const subject = `Authorization Request Update: ${productName}`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px;">
            <h2>Hello ${vendorName},</h2>
            <p>Your authorization request for product <strong>${productName}</strong> has been <strong>${status}</strong> by <strong>${oemName}</strong>.</p>
            ${remarks ? `<p><strong>Comments:</strong> ${remarks}</p>` : ''}
            <p>Login to your dashboard to view the official certificate or update your request.</p>
            <hr/>
            <p style="font-size: 12px; color: #666;">GovProNet Team</p>
        </div>
    `;
    await sendEmail({ to: email, subject, html });
}

export async function sendPaymentConfirmationEmail(email: string, name: string, amount: number, planName: string, transactionId: string) {
    const subject = `Payment Confirmation: ${planName}`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px;">
            <h2>Hello ${name},</h2>
            <p>Thank you for your purchase. We have successfully received your payment.</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p style="margin: 5px 0;"><strong>Plan:</strong> ${planName}</p>
                <p style="margin: 5px 0;"><strong>Amount:</strong> ₹${amount.toFixed(2)}</p>
                <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>Your membership benefits are now active.</p>
            <hr/>
            <p style="font-size: 12px; color: #666;">GovProNet Team</p>
        </div>
    `;
    await sendEmail({ to: email, subject, html });
}

export async function sendEventRegistrationEmail(email: string, name: string, eventName: string, eventDate: string) {
    const subject = `Event Registration Confirmed: ${eventName}`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px;">
            <h2>Hello ${name},</h2>
            <p>You have successfully registered for <strong>${eventName}</strong>.</p>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p>We look forward to seeing you there!</p>
            <hr/>
            <p style="font-size: 12px; color: #666;">GovProNet Team</p>
        </div>
    `;
    await sendEmail({ to: email, subject, html });
}

export async function sendSignUpPage(mobileOTP: string, emailOTP: string, email: string) {
    const subject = 'GovProNet - SignUp | Testing OTP'
    const html = `
        <div style="font-family: sans-serif; padding: 20px;">
            <h2>Hello User,</h2>
            <p>Thank you for registering for GovProNet. Please use the following OTP to verify your account.</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p style="margin: 5px 0;"><strong>Mobile OTP:</strong> ${mobileOTP}</p>
                <p style="margin: 5px 0;"><strong>Email OTP:</strong> ${emailOTP}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>Please use the OTP to verify your account.</p>
            <hr/>
            <p style="font-size: 12px; color: #666;">GovProNet Team</p>
        </div>
    `;
    await sendEmail({ to: email, subject, html });
}

export async function sendForgotPasswordEmail(email: string, token: string) {
    const subject = 'GovProNet - Forgot Password'
    const html = `
        <div style="font-family: sans-serif; padding: 20px;">
            <h2>Hello User,</h2>
            <p>Thank you for requesting a password reset. Please use the following link to reset your password.</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p style="margin: 5px 0;"><strong>Reset Link:</strong> ${token}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>Please use the link to reset your password.</p>
            <hr/>
            <p style="font-size: 12px; color: #666;">GovProNet Team</p>
        </div>
    `;
    await sendEmail({ to: email, subject, html });
}

