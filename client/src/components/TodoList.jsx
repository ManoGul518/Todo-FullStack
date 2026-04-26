import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TodoItem from './TodoItem';

function SortableTodoItem({ todo, onToggle, onDelete, onUpdate }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging,  } = useSortable({ id: todo.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} onUpdate={onUpdate} />
        </div>
    )
};

function TodoList({ todos, onToggle, onDelete, onUpdate, onReorder }) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10
            }
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;
        if (active.id !== over.id) {
            const oldIndex = todos.findIndex(t => t.id === active.id);
            const newIndex = todos.findIndex(t => t.id === over.id);
            onReorder(oldIndex, newIndex);
        }
    };

    if (todos.length === 0) {
        return <p className='empty-state'>No tasks yet. Add one above!</p>;
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={todos.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div id="todo-list">
                    {todos.map(todo => (
                        <SortableTodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={onToggle}
                            onDelete={onDelete}
                            onUpdate={onUpdate}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}

export default TodoList;