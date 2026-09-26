const express = require("express");
const cors = require("cors");
const fs = require("fs"); // ADDED: Built-in Node module to read/write files

const app = express();
const PORT = 5000;
const DATA_FILE = "./tasks.json"; // ADDED: The file where tasks will be permanently saved

// Middleware
app.use(cors());
app.use(express.json());

// ADDED: Helper function to get tasks from the JSON file
function readTasks() {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    // If the file doesn't exist yet, return an empty array
    return [];
  }
}

// ADDED: Helper function to save tasks into the JSON file
function writeTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// ===============================
// GET ALL TASKS
// ===============================
app.get("/api/tasks", (req, res) => {
    const tasks = readTasks(); // Read from file instead of memory
    res.json(tasks);
});

// ===============================
// GET ONE TASK
// ===============================
app.get("/api/tasks/:id", (req, res) => {
    const tasks = readTasks();
    const id = Number(req.params.id);
    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
});

// ===============================
// ADD NEW TASK
// ===============================
app.post("/api/tasks", (req, res) => {
    const tasks = readTasks();
    
    const { title, description, date, status } = req.body;
    
    const newTask = {
        id: Date.now(),
        title: title,
        description: description,
        date: date,
        status: status
    };

    tasks.push(newTask);
    writeTasks(tasks); // Save updated list to the file!

    res.status(201).json(newTask);
});

// ===============================
// UPDATE TASK
// ===============================
app.put("/api/tasks/:id", (req, res) => {
    const tasks = readTasks();
    const id = Number(req.params.id);
    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({ message: "Task not found" });
    }

    tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
    writeTasks(tasks); // Save updated list to the file!

    res.json(tasks[taskIndex]);
});

// ===============================
// DELETE TASK
// ===============================
app.delete("/api/tasks/:id", (req, res) => {
    const tasks = readTasks();
    const id = Number(req.params.id);
    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({ message: "Task not found" });
    }

    const deletedTask = tasks.splice(taskIndex, 1);
    writeTasks(tasks); // Save updated list to the file!

    res.json({
        message: "Task deleted successfully",
        task: deletedTask[0]
    });
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});