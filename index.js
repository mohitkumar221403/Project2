const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");
const { sendSMS } = require('./twilio');

const app = express();
dotenv.config();

const port = process.env.PORT || 3000;

// MongoDB connection
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
const dbName = process.env.MONGODB_DBNAME;
mongoose.connect(`mongodb+srv://${username}:${password}@post1.plz9ouo.mongodb.net/${dbName}?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define schema for registration
const registrationSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

// Define schema for appointments
const appointmentSchema = new mongoose.Schema({
  name: String,
  email: String,
  date: Date,
  time: String,
  area: String
});

// Create schema feedback
const feedbackSchema = new mongoose.Schema({
  name: String,
  email: String,
  feedback: String
});

// Create models for registration and appointments
const Registration = mongoose.model("Registration", registrationSchema);
const Appointment = mongoose.model("Appointment", appointmentSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serving static files (HTML)
app.use(express.static(path.join(__dirname, "pages")));

// Routes

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

// Registration route
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await Registration.findOne({ email });

    if (!existingUser) {
      const registrationData = new Registration({
        name,
        email,
        password
      });
      await registrationData.save();
res.redirect("/success.html"); // Redirect to success.html after successful registration
    } else {
      console.log("User already exists");
      res.redirect("/error");
    }
  } catch (error) {
    console.error(error);
    res.redirect("/error");
  }
});

// Login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Registration.findOne({ email, password });

    if (user) {
      res.redirect("/success");
    } else {
      console.log("Invalid credentials");
      res.redirect("/error");
    }
  } catch (error) {
    console.error(error);
    res.redirect("/error");
  }
});

// Profile route
app.get("/profile", (req, res) => {
  const { name } = req.query; // Retrieve name from query parameters
  res.send(`<h1>Profile Page</h1><p>Welcome, ${name}!</p><p>Thank you for registering.</p>`); // Display user's name on the profile page
});

// Appointment route
 // Import the Appointment model

app.post("/appointment", async (req, res) => {
  try {
    const { name, email, date, time, area } = req.body;

    // Create a new Appointment instance
    const newAppointment = new Appointment({
      name,
      email,
      date,
      time,
      area
    });

    // Save the new appointment to MongoDB
    await newAppointment.save();

    // Redirect to a success page after appointment is saved
    res.redirect("/appointment/success");
  } catch (error) {
    console.error(error);
    // Redirect to an error page if there's an error saving the appointment
    res.redirect("/appointment/error");
  }
});



// Success and error routes
app.get("/success", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "success.html"));
});

app.get("/error", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "error.html"));
});


//bshdgsagd
///
// feedback


// Create model Feedback
const Feedback = mongoose.model('Feedback', feedbackSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Route to handle feedback submission
app.post('/feedback', (req, res) => {
  const { name, email, feedback } = req.body;

  const newFeedback = new Feedback({
    name,
    email,
    feedback
  });

  newFeedback.save()
    .then(() => {
      res.status(200).send('Feedback saved successfully');
    })
    .catch(error => {
      console.error('Error saving feedback:', error);
      res.status(500).send('Error saving feedback');
    });
});

// Route to fetch all feedbacks
app.get('/feedback', (req, res) => {
  Feedback.find({})
    .then(feedbacks => {
      res.status(200).json(feedbacks);
    })
    .catch(error => {
      console.error('Error retrieving feedbacks:', error);
      res.status(500).send('Error retrieving feedbacks');
    });
});



// Twilio route

// Serve medicine.html file
app.get("/medicine", (req, res) => {
  res.sendFile(path.join(__dirname, "medicine.html"));
});

app.get('/start-alarm', (req, res) => {
  const duration = parseInt(req.query.duration);
  const phoneNumber = req.query.phoneNumber;
  
  if (isNaN(duration) || duration <= 0 || !phoneNumber) {
    return res.status(400).send('Invalid duration or phone number');
  }

  // Send the initial SMS immediately
  sendSMS(`This is an automated message from Vikash Academy. Phone: ${phoneNumber}`);

  // Set interval for sending message every 1 minute for the duration specified
  setTimeout(() => {
    clearInterval(alarmInterval); // Stop the initial interval
    console.log(`Alarm stopped after ${duration} minutes.`);
  }, duration * 60000); // Convert minutes to milliseconds

  // Set interval for sending message every 1 minute after the specified duration
  alarmInterval = setInterval(() => {
    sendSMS(`This is an automated message from Vikash Academy. Phone: ${phoneNumber}`);
  }, 60000); // 60000 milliseconds = 1 minute

  res.sendStatus(200); // Send response to client
});

app.get('/stop-alarm', (req, res) => {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    console.log('Alarm stopped manually.');
  }
  res.sendStatus(200); // Send response to client
});


// form -emergency

// Define a schema for your MongoDB documents
const formDataSchema = new mongoose.Schema({
  field1: String,
  field2: String,
  field3: String,
  field4: String
});

// Create a model for your MongoDB documents
const FormData = mongoose.model('FormData', formDataSchema);

// Handle form submission
app.post('/submit-form', (req, res) => {
  const { field1, field2, field3, field4 } = req.body;

  // Create a new document with submitted form data
  const newFormData = new FormData({
    field1,
    field2,
    field3,
    field4
  });
    // Save the new document to the database
  newFormData.save()
    .then(() => {
      console.log('Form data saved to MongoDB');
      res.sendStatus(200);
    })
    .catch(err => {
      console.error('Error saving form data:', err);
      res.sendStatus(500);
    });
});



// /medicine order 


// Define schema for orders
const orderSchema = new mongoose.Schema({
  medicineName: String,
  quantity: Number,
  deliveryAddress: String,
});

const Order = mongoose.model('Order', orderSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.post('/submit-order', (req, res) => {
  const { medicineName, quantity, deliveryAddress } = req.body;
  const newOrder = new Order({
    medicineName,
    quantity,
    deliveryAddress,
  });
  
  newOrder.save()
    .then((savedOrder) => {
      const orderDetails = {
        medicineName: savedOrder.medicineName,
        quantity: savedOrder.quantity,
        deliveryAddress: savedOrder.deliveryAddress,
      };
      res.status(200).json(orderDetails);
    })
    .catch(err => {
      console.error('Error saving order:', err);
      res.status(500).send('Internal server error');
    });
});












// Start server
app.listen(port, () => {
  console.log(`The server is running on port ${port}`);
});
