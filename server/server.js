const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: 'https://todoapp-delta-vert.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err.message));

// Define Todo schema and model
const todoSchema = new mongoose.Schema({
    task: { type: String, required: true },
    order: { type: Number, default: -1 },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
const Todo = mongoose.model('Todo', todoSchema);

// Routes

app.get('/', (req, res) => {
    res.send('Backend is working 🚀');
});

// GET - return all todos
app.get('/todos', async (req, res) => {
    try {
        const todos = await Todo.find().sort({ order: 1 });
        console.log("Todos fetched:", todos.length);
        res.json(todos)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

// POST - create a new todo
app.post('/todos', async (req, res) => {
    const lastTodo = await Todo.findOne().sort({ order: -1 });
    const newOrder = lastTodo ? lastTodo.order + 1 : 0;

    try {
        const newTodo = new Todo({
            task: req.body.task,
            order: newOrder
        });
        const saved = await newTodo.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT - update order of todos
app.put('/todos/reorder', async (req, res) => {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ error: 'orderedIds must be an array' });
    }
    if (!orderedIds.every(id => mongoose.Types.ObjectId.isValid(id))) {
        return res.status(400).json({ error: 'Invalid IDs in orderedIds' });
    }

    // Reorder todos based on ordered IDs
    try {
        await Todo.bulkWrite(
            orderedIds.map((id, index) => ({
                updateOne: {
                    filter: { _id: id },
                    update: { order: index }
                }
            }))
        );

        res.status(200).json({ message: 'Order updated' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT - update todo (task or completed)
app.put('/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = {};
        if (req.body.task !== undefined) updates.task = req.body.task;
        if (req.body.completed !== undefined) updates.completed = req.body.completed;

        const updated = await Todo.findByIdAndUpdate(id, updates, { new: true });
        if (!updated) return res.status(404).json({ error: 'Todo not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE - delete a todo
app.delete('/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Todo.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ error: 'Todo not found' });
        res.status(204).send();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE - delete all completed todos
app.delete('/todos', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) {
            return res.status(400).json({ error: 'ids must be an array' });
        }
        await Todo.deleteMany({ _id: { $in: ids } });
        res.status(204).send();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
