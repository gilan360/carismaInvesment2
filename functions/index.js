const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const cors = require("cors")({origin: true});

const gmailEmail = "investment.carisma@gmail.com";
const gmailPassword = "jtgs vqat johq dtzh";

admin.initializeApp();

const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

const getFormattedTimestamp = () => {
  const currentDate = new Date();

  // Get the components of the date
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const hours = String(currentDate.getHours()).padStart(2, "0");
  const minutes = String(currentDate.getMinutes()).padStart(2, "0");

  // Format the timestamp without seconds
  const formattedTimestamp = `${year}-${month}-${day}-${hours}-${minutes}`;

  return formattedTimestamp;
};

exports.sendEmail = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const {name, number, email, message} = req.body;

      if (!email) {
        throw new Error("No recipients defined");
      }

      const mailOptions = {
        from: gmailEmail,
        to: "efsaaktas@outlook.com",
        subject: "Subject of the email",
        text: `${name} isimli  ${number} numara ve ${email} emaile sahip kişi,
              \n ${message} bu mesajı gönderdi`,
      };

      await mailTransport.sendMail(mailOptions);

      res.status(200).send("Email sent successfully!");

      const date = getFormattedTimestamp();

      const databaseRef = admin.database().ref("formSubmissions");
      const newSubmissionRef = databaseRef.push();
      await newSubmissionRef.set({
        name: name,
        number: number,
        email: email,
        message: message,
        date: date,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).send("Error sending email: " + error.toString());
    }
  });
});
