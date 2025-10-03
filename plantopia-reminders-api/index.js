const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

// Firebase Admin setup
const serviceAccount = require("./serviceAccountKey.json"); // download from Firebase console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();
app.use(express.json());
app.use(cors());

// Add Reminder
app.post("/reminders", async (req, res) => {
  try {
    const { userId, title, date } = req.body;
    if (!userId || !title || !date) {
      return res.status(400).send({ error: "Missing fields" });
    }

    const newReminder = {
      userId,
      title,
      date,
      createdAt: new Date()
    };

    const docRef = await db.collection("reminders").add(newReminder);
    res.status(201).send({ id: docRef.id, ...newReminder });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get Reminders for User
app.get("/reminders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await db.collection("reminders").where("userId", "==", userId).get();

    if (snapshot.empty) {
      return res.status(200).send([]);
    }

    let reminders = [];
    snapshot.forEach(doc => {
      reminders.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).send(reminders);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Update Reminder
app.put("/reminders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date } = req.body;

    await db.collection("reminders").doc(id).update({ title, date });
    res.status(200).send({ message: "Reminder updated successfully" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Delete Reminder
app.delete("/reminders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("reminders").doc(id).delete();
    res.status(200).send({ message: "Reminder deleted successfully" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
