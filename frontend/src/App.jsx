import { useEffect, useState } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("Pending");
  const [editId, setEditId] = useState(null);

  // NEW: Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const getTasks = async () => {
    const response = await fetch("http://localhost:5000/api/tasks");
    const data = await response.json();
    setTasks(data);
  };

  useEffect(() => {
    getTasks();
  }, []);

  const handleSaveTask = async (e) => {
    e.preventDefault();

    if (!title || !description || !date) {
      alert("Please fill all fields");
      return;
    }

    const taskData = { title, description, date, status };

    if (editId) {
      const response = await fetch(`http://localhost:5000/api/tasks/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
      });
      const updatedTask = await response.json();
      setTasks(tasks.map((task) => (task.id === editId ? updatedTask : task)));
      setEditId(null);
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

  const triggerEdit = (task) => {
    setTitle(task.title);
    setDescription(task.description);
    setDate(task.date);
    setStatus(task.status);
    setEditId(task.id);
    window.scrollTo(0, 0);
  };

  // NEW: Filter the tasks array before displaying it on the screen
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || task.status === filterStatus;
    
    // Only show tasks that match both the search text AND the dropdown status
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <h1>Class Task Management System</h1>
      <p>Manage class tasks date-wise.</p>

      <h2>{editId ? "Edit Task" : "Add New Task"}</h2>
      <form onSubmit={handleSaveTask}>
        <div>
          <label>Task Title</label><br />
          <input type="text" placeholder="Enter task title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div><br />
        
        <div>
          <label>Description</label><br />
          <textarea placeholder="Enter task description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div><br />
        
        <div>
          <label>Date</label><br />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div><br />
        
        <div>
          <label>Status</label><br />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div><br />
        
        <button type="submit" style={{ backgroundColor: editId ? "#28a745" : "", color: editId ? "white" : ""}}>
          {editId ? "Update Task" : "Add Task"}
        </button>
        
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setTitle(""); setDescription(""); setDate(""); setStatus("Pending"); }} style={{ marginLeft: "10px" }}>
            Cancel
          </button>
        )}
      </form>

      <hr />

      <h2>Task List</h2>

      {/* NEW: Search and Filter Controls UI */}
      <div style={{ marginBottom: "20px", padding: "10px", backgroundColor: "#f1f1f1", borderRadius: "5px" }}>
        <label style={{ marginRight: "10px" }}>🔍 Search:</label>
        <input 
          type="text" 
          placeholder="Search by title..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          style={{ marginRight: "20px" }}
        />

        <label style={{ marginRight: "10px" }}>📂 Filter Status:</label>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="All">All Tasks</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* CHANGED: We map over filteredTasks instead of the main tasks array */}
      {filteredTasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        filteredTasks.map((task) => (
          <div key={task.id}>
            <h3>{task.title}</h3>
            <p>Description: {task.description}</p>
            <p>Date: {task.date}</p>
            <p>Status: {task.status}</p>
            
            <button onClick={() => triggerEdit(task)} style={{ backgroundColor: "#007bff", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", marginRight: "10px" }}>Edit Task</button>
            <button onClick={() => deleteTask(task.id)} style={{ backgroundColor: "#dc3545", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}>Delete Task</button>
            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default App;