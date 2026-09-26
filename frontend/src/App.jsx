import { useEffect, useState } from "react";
import "./App.css"; // NEW: Connects our beautiful CSS file!

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("Pending");

  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // NEW: State for our error message instead of annoying popups
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

    // NEW: Clean Error Handling
    if (!title || !description || !date) {
      setErrorMsg("⚠️ Please fill out all fields before saving the task.");
      return;
    }
    setErrorMsg(""); // Clear error if everything is fine!

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

  const handleEditClick = (task) => {
    setTitle(task.title);
    setDescription(task.description);
    setDate(task.date);
    setStatus(task.status);
    setEditingId(task.id);
    setErrorMsg(""); // Clear errors when editing
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container">
      <h1>📚 Class Task Management System</h1>
      
      <h2>{editingId !== null ? "✏️ Edit Task" : "➕ Add New Task"}</h2>
      
      {/* NEW: Displays the error message safely on the screen */}
      {errorMsg && <div className="error-box">{errorMsg}</div>}
      
      <form onSubmit={handleSubmit}>
        <label>Task Title</label>
        <input type="text" placeholder="Enter task title" value={title} onChange={(e) => setTitle(e.target.value)} />
        
        <label>Description</label>
        <textarea placeholder="Enter task description" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} />
        
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        
        <button type="submit" className={editingId !== null ? "btn-warning btn-primary" : "btn-primary"}>
          {editingId !== null ? "Update Task" : "Add Task"}
        </button>
        
        {editingId !== null && (
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => {
              setEditingId(null);
              setTitle("");
              setDescription("");
              setDate("");
              setStatus("Pending");
              setErrorMsg("");
            }} 
            style={{ marginTop: "10px", width: "100%" }}
          >
            Cancel Edit
          </button>
        )}
      </form>

      <h2>📋 Task List</h2>

      <div className="search-bar">
        <div style={{ flex: 1 }}>
          <label>🔍 Search:</label>
          <input 
            type="text" 
            placeholder="Search by title..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label>📂 Filter by Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <p style={{ textAlign: "center", color: "#777" }}>No tasks found.</p>
      ) : (
        filteredTasks.map((task) => (
          <div key={task.id} className="task-card">
            <h3 style={{ margin: "0 0 10px 0", color: "#2c3e50" }}>{task.title}</h3>
            <p style={{ margin: "5px 0" }}><strong>Description:</strong> {task.description}</p>
            <p style={{ margin: "5px 0" }}><strong>Date:</strong> {task.date}</p>
            <p style={{ margin: "5px 0" }}><strong>Status:</strong> {task.status}</p>
            
            <div style={{ marginTop: "15px" }}>
              <button className="btn-warning" onClick={() => handleEditClick(task)} style={{ marginRight: "10px" }}>
                Edit
              </button>
              <button className="btn-danger" onClick={() => deleteTask(task.id)}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default App;