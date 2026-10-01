const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 1. Connect to MongoDB Cloud (Using your exact credentials)
const mongoURI = "mongodb+srv://dbaner10_db_user:ORbG3mqWTnfynP9c@cluster0.uysih8p.mongodb.net/task-manager?appName=Cluster0";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ Successfully connected to MongoDB Cloud!"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 2. Define how a Task should look in the database
const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: String,
  status: String
});

// Trick to smoothly convert MongoDB's "_id" into standard "id" for our React frontend
taskSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Task = mongoose.model("Task", taskSchema);

// 3. API Routes

// GET: Fetch all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// POST: Add a new task
app.post("/api/tasks", async (req, res) => {
  try {
    const newTask = new Task({
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      status: req.body.status
    });
    
    const savedTask = await newTask.save();
    res.json(savedTask);
  } catch (error) {
    res.status(500).json({ error: "Failed to save task" });
  }
});

// PUT: Update an existing task
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true } // Returns the updated task instead of the old one
    );
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE: Delete a task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});