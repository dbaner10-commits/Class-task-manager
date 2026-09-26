import { useEffect, useState } from "react";
import "./App.css"; 

function App() {
  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("Pending");

  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  
  // ADDED: A new state to hold our error messages
  const [errorMsg, setErrorMsg] = useState("");

  const getTasks = async () => {
    const response = await fetch("http://localhost:5000/api/tasks");
    const data = await response.json();
    setTasks(data);
  };

  useEffect(() => {
    getTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // CHANGED: Instead of alert(), we set our nice error message state
    if (!title || !description || !date) {
      setErrorMsg("⚠️ Please fill out all fields before saving the task.");
      return; 
    }

    // If everything is filled out, clear any old errors!
    setErrorMsg("");

    const taskData = { title, description, date, status };

    if (editingId !== null) {
      const response = await fetch(`http://localhost:5000/api/tasks/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
      });
      const updatedTask = await response.json();
      setTasks(tasks.map((task) => (task.id === editingId ? updatedTask : task)));
      setEditingId(null);
    } else {
      const response = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
      });
      const data = await response.json();
      setTasks([...tasks, data]);
    }

    setTitle("");
    setDescription("");
    setDate("");
    setStatus("Pending");
  };

  const deleteTask = async (id) => {
    await fetch(`http://localhost:5000/api/tasks/${id}`, { method: "DELETE" });
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleEdit = (task) => {
    setTitle(task.title);
    setDescription(task.description);
    setDate(task.date);
    setStatus(task.status);
    setEditingId(task.id);
    // Clear any errors when someone clicks edit
    setErrorMsg(""); 
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="app-container">
      <h1>📚 Class Task Management System</h1>
      <p style={{ textAlign: "center" }}>Manage class tasks date-wise.</p>

      <h2>{editingId !== null ? "✏️ Edit Task" : "➕ Add New Task"}</h2>
      
      {/* ADDED: If there is an error, show this red box! */}
      {errorMsg && (
        <div style={{ backgroundColor: "#ffeaea", color: "red", padding: "10px", borderRadius: "5px", marginBottom: "15px", border: "1px solid red" }}>
          {errorMsg}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="form-container">
        <div>
          <label>Task Title</label>
          <input
            type="text"
            className="input-field"
            placeholder="Enter task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            className="input-field"
            placeholder="Enter task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label>Date</label>
          <input
            type="date"
            className="input-field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label>Status</label>
          <select 
            className="input-field" 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <button type="submit" className="btn-primary">
          {editingId !== null ? "Update Task" : "Add Task"}
        </button>
      </form>
      
      <h2>📋 Task List</h2>

      <div className="search-row">
        <input
          type="text"
          className="input-field"
          style={{ marginBottom: "0" }}
          placeholder="Search tasks by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select 
          className="input-field"
          style={{ marginBottom: "0", width: "200px" }}
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {filteredTasks.length === 0 ? (
        <p style={{ textAlign: "center", color: "#7f8c8d" }}>No tasks found.</p>
      ) : (
        filteredTasks.map((task) => (
          <div key={task.id} className="task-card">
            <h3>{task.title}</h3>
            <p><strong>Description:</strong> {task.description}</p>
            <p><strong>Date:</strong> {task.date}</p>
            <p><strong>Status:</strong> <span className="status-badge">{task.status}</span></p>
            
            <button onClick={() => handleEdit(task)} className="btn-edit">
              Edit Task
            </button>
            <button onClick={() => deleteTask(task.id)} className="btn-delete">
              Delete Task
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default App;