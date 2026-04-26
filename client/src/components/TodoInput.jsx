import { useState } from "react";

function TodoInput({ onAdd }) {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onAdd(text);
            setText('');
        }
    };

    return (
        <form className="input-section" onSubmit={handleSubmit}>
            <input
                type="text"
                id="task-input"
                placeholder="Type in your tasks.."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <button type="submit" id="add-button">+</button>
        </form>
    );
}

export default TodoInput;