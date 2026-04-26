import { useState, useEffect } from 'react'
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';
import './style.css';

function App() {
  const API_BASE = 'https://todo-app-assignment.up.railway.app';
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE}/todos`);
        if (!response.ok) throw new Error('Failed to fetch todos');
        const data = await response.json();
        const todosWithId = data.map(todo => ({ ...todo, id: todo._id }));
        setTodos(todosWithId);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching todos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  const reorderTodos = async (oldIndex, newIndex) => {
    const reordered = [...todos];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    setTodos(reordered);
    const orderedIds = reordered.map(t => t.id).filter(id => typeof id === 'string' && id.length === 24);
    try {
      const response = await fetch(`${API_BASE}/todos/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds })
      });
      if (!response.ok) throw new Error('Failed to reorder todos');
    } catch (err) {
      setError(err.message);
      console.error('Error sending ordered Ids', err);
    }
  };

  const addTodo = async (task) => {
    try {
      const response = await fetch(`${API_BASE}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: task.trim() })
      });

      if (!response.ok) throw new Error('Failed to add todo');
      const newTodo = await response.json();
      setTodos(prev => [...prev, { ...newTodo, id: newTodo._id }]);
    } catch (err) {
      setError(err.message);
      console.error('Error adding todo', err);
    }
  };

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const response = await fetch(`${API_BASE}/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed })
      });

      if (!response.ok) throw new Error('Failed to toggle todo');
      const updated = await response.json();
      setTodos(prev => prev.map(t => t.id === id ? { ...updated, id: updated._id } : t))
    } catch (err) {
      setError(err.message);
      console.error('Error toggling todo', err);
    }
  };

  const deleteTodo = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const response = await fetch(`${API_BASE}/todos/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete todo');
      setTodos(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      setError(err.message);
      console.error('Error deleting todo', err);
    }
  };

  const updateTodo = async (id, newTask) => {
    try {
      const response = await fetch(`${API_BASE}/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: newTask.trim() })
      });

      if (!response.ok) throw new Error('Failed to update todo');
      const updated = await response.json();
      setTodos(prev => prev.map(t => t.id === id ? { ...updated, id: updated._id } : t))
    } catch (err) {
      setError(err.message);
      console.error('Error updating todo', err);
    }
  };

  const clearCompleted = async () => {
    const completedIds = todos.filter(t => t.completed).map(t => t.id);
    if (completedIds.length === 0) return;

    try {
      const response = await fetch(`${API_BASE}/todos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: completedIds })
      });

      if (!response.ok) throw new Error('Failed to delete completed todos');
      setTodos(todos.filter(todo => !todo.completed));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting completed todos');
    }
  };

  const getStats = () => {
    const stats = {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      pending: todos.filter(t => t.completed === false).length
    }
    alert(`Total Tasks: ${stats.total}\nCompleted: ${stats.completed}\nPending: ${stats.pending}`);
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'pending') return !todo.completed;
    return true;
  });

  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;

  if (loading) {
    return <div className="empty-state-container"><p className="loading">Loading...</p></div>;
  }

  return (
    <div className="container">
      <p className="error-state">{error || ''}</p>
      <h1>📝 TODO APP</h1>

      <TodoInput onAdd={addTodo} />

      <div className="todo-container">
        {todos.length > 0 ? (
          <div className="buttons-container">
            <button onClick={getStats} data-action="get-stats"><i className="fa-regular fa-chart-bar"></i></button>
            <button onClick={clearCompleted} data-action="clear-all-completed">
              <i className="fa-solid fa-trash"></i>
            </button>
            <div className="filter-container">
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">Show All</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        ) : null}

        <TodoList
          todos={filteredTodos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onUpdate={updateTodo}
          onReorder={reorderTodos}
        />

        <p className="task-count">
          Task: <span id="total-count">{total}</span> | Completed: <span id="completed-count">{completed}</span>
        </p>
      </div>
    </div>
  );

}

export default App;