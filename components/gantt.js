import { forwardRef, useEffect, useRef, useState } from 'react'
import { eachDayOfInterval, format, isSameDay, isToday, compareAsc } from 'date-fns'
import { DndProvider, useDrag } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { parseDate, formatDate, validateDate } from '../utils/utils'

const getDays = (json) => {
    const tasks = json.tasks;
    const starts = tasks.map((task) => task.start);
    const ends = tasks.map((task) => task.end);
    if (starts.length == 0 || ends.length === 0) {
        return [];
    }
    starts.sort(compareAsc);
    ends.sort(compareAsc);
    console.log(starts);
    return eachDayOfInterval({ start: starts[0], end: ends[ends.length - 1] });
};


const Gantt = forwardRef(({ json, setJson }, ref) => {
    const days = getDays(json);
    const sorted = [...json.tasks].sort((a, b) => compareAsc(a.start, b.start));
    const [draggingIndex, setDraggingIndex] = useState(-1);
    return (
        <DndProvider backend={HTML5Backend}>
            <div className="my-3 grid w-min overflow-y-hidden relative rounded-lg shadow-md" ref={ref}>
                <Header days={days} />
                <Divider days={days} />
                {sorted.map((task, index) => (
                    <Row
                        task={task}
                        days={days}
                        key={task.id}
                        disabled={draggingIndex !== -1 && draggingIndex !== index}
                        setDragging={(isDragging) => {
                            if (isDragging) {
                                setDraggingIndex(index);
                            } else if (draggingIndex === index) {
                                setDraggingIndex(-1);
                            }
                        }}
                        onEditTask={(updatedTask) => {
                            const copy = [...sorted]
                            copy[index] = updatedTask
                            setJson({ ...json, tasks: copy })
                        }}
                    />))}
            </div >
        </DndProvider>);
});

export default Gantt;

const getTemplateColumns = (days) => `200px 200px 100px 100px repeat(${days.length}, 40px)`;

const Header = ({ days }) => (
    <div className="bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 text-white text-opacity-50" style={{
        display: 'grid',
        gridTemplateColumns: getTemplateColumns(days),
    }}>
        <div className="m-auto">Title</div>
        <div className="m-auto">Assign</div>
        <div className="m-auto">Start</div>
        <div className="m-auto">End</div>
        {days.map((day) => <div key={day} className="grid grid-rows-3 py-2 m-auto">
            <span className="text-center">{format(day, 'MMM')}</span>
            <span className="text-center">{format(day, 'dd')}</span>
            <span className="text-center">{format(day, 'eeeee')}</span>
        </div>)}
    </div>
);

const Divider = ({ days }) => (
    <div className="absolute w-full h-full" style={{
        display: 'grid',
        gridTemplateColumns: getTemplateColumns(days),
    }}>
        <span className="block border-r border-pink-500 opacity-10"></span>
        <span className="block border-r border-pink-500 opacity-10"></span>
        <span className="block border-r border-pink-500 opacity-10"></span>
        <span className="block border-r border-pink-500 opacity-10"></span>
        {days.map((day) => {
            if (isToday(day)) {
                return <span key={day} className="block border-r border-pink-500 opacity-10 bg-pink-500"></span>
            } else {
                return <span key={day} className="block border-r border-pink-500 opacity-10"></span>
            }
        })}
    </div>
);

const ItemTypes = {
    ROW: 'row'
}

const Row = ({ task, days, disabled, setDragging, onEditTask }) => {
    return (<div className="relative">
        <div
            className={`even:bg-gray-50 bg-white`}
            style={{
                display: 'grid',
                gridTemplateColumns: `200px 200px 100px 100px repeat(${days.length}, 40px)`,
            }}>
            <div className="m-auto">
                <TextInput text={task.title} onEdit={(text) => {
                    onEditTask({ ...task, title: text })
                }} />
            </div>
            <div className="m-auto">
                <TextInput text={task.assign} onEdit={(text) => {
                    onEditTask({ ...task, assign: text })
                }} />
            </div>
            <div className="m-auto">
                <TextInput text={formatDate(task.start)}
                    key={formatDate(task.start)}
                    onEdit={(text) => {
                        onEditTask({ ...task, start: parseDate(text) })
                    }}
                    validate={validateDate} />
            </div>
            <div className="m-auto">
                <TextInput text={formatDate(task.end)}
                    key={formatDate(task.end)}
                    onEdit={(text) => {
                        onEditTask({ ...task, end: parseDate(text) })
                    }}
                    validate={validateDate} />
            </div>
            <Task task={task} days={days} setDragging={setDragging} onEdit={(text) => {
                onEditTask({ ...task, title: text })
            }} />
        </div>
        {disabled && <div className="bg-white absolute opacity-80 top-0 left-0 right-0 bottom-0 z-30" />}
    </div >);
};

const TextInput = ({ text, onEdit, validate }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editingText, setEditingText] = useState(text)
    const [hasError, setHasError] = useState(false)
    const ref = useRef(null);
    const onEditDone = () => {
        if (!validate || validate(editingText)) {
            setIsEditing(false)
            onEdit && onEdit(editingText)
        } else {
            setHasError(true)
        }
    }
    useEffect(() => {
        ref.current?.focus()
    }, [isEditing])
    return (isEditing ? (
        <input
            type='text'
            value={editingText}
            ref={ref}
            className={`block border w-full pl-1 text-center ${hasError ? "text-red-500" : ""}`}
            onChange={(e) => {
                e.preventDefault();
                setEditingText(e.target.value);
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                    onEditDone()
                }
            }} />
    ) : (<p className="w-full text-center" onClick={() => setIsEditing(prev => !prev)}>{editingText}</p >
    ));

}

const Task = ({ task, days, setDragging }) => {
    let startIndex = -1, endIndex = -1;
    for (let i = 0; i < days.length; i++) {
        if (startIndex === -1 && isSameDay(task.start, days[i])) {
            startIndex = i;
        }
        if (endIndex === -1 && isSameDay(task.end, days[i])) {
            endIndex = i;
        }
        if (startIndex !== -1 && endIndex != -1) {
            break;
        }
    }
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.ROW,
        collect: monitor => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));
    setDragging(isDragging);
    return (<div
        ref={drag}
        className={`text-center text-white mx-1 bg-${getColor(task.assign)}-300 cursor-move opacity-${isDragging ? 50 : 100} rounded-full my-2 shadow z-20`}
        style={{
            gridColumn: `${startIndex + 5}/${endIndex + 6}`,
        }}>
        {task.title}
    </div>)
};

const hash = (s) => {
    let h = 9;
    for (let i = 0; i < s.length; i++) {
        h = Math.imul(h ^ s.charCodeAt(i++), 9 ** 9);
    }
    return h ^ h >>> 9
}

const colors = ['red', 'yellow', 'green', 'blue', 'indigo', 'purple', 'pink'];
const getColor = (assign) => colors[Math.abs(hash(assign)) % colors.length];
