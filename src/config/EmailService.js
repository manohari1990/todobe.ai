// Create an SES client. Configure your AWS credentials and region
// using environment variables, shared credentials file, or IAM roles.
// IAM user name: ses-smtp-user.20260919-221530
// SMTP user name: AKIA3ADP2G7NGZGBA664
// SMTP password: BFD9dnw5w5B8i0l8kop2aq3IREfg62Po1m9gwbK/pIE6   - ,ZE9)TF{&iyFrg[p10ZoWN7W7QIQcsXw
import nodemailer from 'nodemailer';
// import {SESv2Client, SendEmailCommand} from '@aws-sdk/client-sesv2' // for AWS SES service

export const EmailTransporter = nodemailer.createTransport({ // Emails are not delivering now
    host: 'qik87pg56iua.hkph.mail-manager-smtp.amazonaws.com',
    port: 587,
    secure: false,
    auth: {
        user: 'inp-s5sw2p4ji5det4xthehmkyax',
        pass: ',ZE9)TF{&iyFrg[p10ZoWN7W7QIQcsXw'
    }
})

export const ForgotPasswordSubject = 'Reset Password requested!'
export const ForgotPasswordTemplate = (userRecord) => {
    const content = `Hi ${userRecord.first_name} ${userRecord.last_name},
        We received a request to reset the password for your account.If you made this request, click the button below to choose a new password: http://localhost:8000/auth/resetpassword/${userRecord.resetToken} (Link valid by ${userRecord.expires_at}). If you didn't request a password reset, you can safely ignore this email. Your password will not change.
        For security, this request was received from a device using IP address ${userRecord.ip_address} on ${new Date(Date.now())}. If you have any questions or need help, contact our support team at todo_suport@gmail.com.
        
        Best regards,
        The Todo Team`

    console.log(content,"============content")
    return content;
}

export const SendEmail = async(record, action) => {
    const emailProps = {}
    switch (action) {
        case "FORGOT_PASSWORD":
            emailProps.subject = ForgotPasswordSubject
            emailProps.content = ForgotPasswordTemplate(record)
            break;
        case "WELCOME_USER":
            break;
        default:
            break;
    }
    try {
        const infoId = await EmailTransporter.sendMail({
            from: 'Admin Support <todo_support@gmail.com>',
            to: record.email,
            subject: emailProps.subject,
            html: emailProps.content
        });
        return infoId
    } catch (e) {
        throw e
    }
}
