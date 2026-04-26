import { useState } from "react";

function TodoItem({ todo, onToggle, onDelete, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.task);

    const handleToggle = () => {
        onToggle(todo.id);
    };

    const handleDelete = () => {
        onDelete(todo.id);
    }

    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleEditChange = (e) => {
        setEditText(e.target.value);
    };

    const handleEditSubmit = (e) => {
        if (e.key === 'Enter') {
            onUpdate(todo.id, editText);
            setIsEditing(false);
        };
    };

    const handleBlur = () => {
        if (isEditing) {
            onUpdate(todo.id, editText);
            setIsEditing(false);
        }
    };

    const dateStr = new Date(todo.createdAt).toLocaleString();

    return (
        <div className="todo-item" data-id={todo.id}>
            <div className="todo-status">
                <span data-action="toggle" onClick={handleToggle}>
                    {todo.completed ? (
                        <i className="fa-regular fa-circle-check"></i>
                    ) : (
                        <i className="fa-regular fa-circle-xmark"></i>
                    )}
                </span>
            </div>
            <div className={`todo-text ${todo.completed ? 'todo-completed' : ''}`}>
                {isEditing ? (
                    <input 
                      className="update-input"
                      value={editText}
                      onChange={handleEditChange}
                      onKeyDown={handleEditSubmit}
                      onBlur={handleBlur}
                      autoFocus
                    />
                ) : (
                    <span onDoubleClick={handleDoubleClick}>{todo.task}</span>
                )}
            </div>
            <button className="delete-btn" data-action="delete" onClick={handleDelete}>
                <i className="fa-solid fa-trash-can"></i>
            </button>
            <div className="todo-date">Added: {dateStr}</div>
        </div>
    );
}

export default TodoItem;