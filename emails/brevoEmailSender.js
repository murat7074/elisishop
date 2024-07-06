// sendVerificationEmail.js
import SibApiV3Sdk from 'sib-api-v3-sdk'

export default async function brevoEmailSender({
  email,
  message,
  subject,
  name,
}) {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.SENDER_EMAIL
  const senderName = process.env.SENDER_NAME

  const defaultClient = SibApiV3Sdk.ApiClient.instance
  const apiKeyInstance = defaultClient.authentications['api-key']
  apiKeyInstance.apiKey = apiKey

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

  // E-posta içeriğini oluşturuyoruz
  let emailContent = message

  if (name) {
    emailContent = `
    <html>
      <head>
        <style>
          h2 {
            font-family: Arial, sans-serif;
            font-size: 18px;
            font-weight: normal;
            margin-left: 10px;
          }
          span {
            font-weight: bold;
            text-transform: capitalize;
          }
        </style>
      </head>
      <body>
        <h2>Merhaba, <span>${name}</span></h2>
        <p>${message}</p>
      </body>
    </html>
  `
  }

  sendSmtpEmail.subject = subject
  sendSmtpEmail.htmlContent = emailContent
  sendSmtpEmail.sender = { name: senderName, email: senderEmail }
  sendSmtpEmail.to = [{ email }]

  try {
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail)
  } catch (error) {
    console.log(error.response.data)
  }
}
