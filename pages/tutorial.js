import { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const Page = () => {
    const [pos, setPos] = useState([0, 0]);
    useEffect(() => {
        observe((knightPosition) => setPos(knightPosition))
    }, []);
    return (<div>
        <Board knightPosition={pos} />
    </div>);

};
const renderSquare = (i, knightPosition) => {
    const x = i % 8;
    const y = Math.floor(i / 8);
    return (
        <div key={i} style={{ width: '12.5%', height: '12.5%' }}>
            <BoardSquare x={x} y={y}>
                {renderPiece(x, y, knightPosition)}
            </BoardSquare>
        </div>
    );
};

const renderPiece = (x, y, [knightX, knightY]) => {
    if (x === knightX && y === knightY) {
        return <Knight />
    }
}

const ItemTypes = {
    KNIGHT: 'knight'
}

const BoardSquare = ({ x, y, children }) => {
    const black = (x + y) % 2 === 1;
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: ItemTypes.KNIGHT,
        canDrop: () => canMoveKnight(x, y),
        drop: () => moveKnight(x, y),
        collect: monitor => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop()
        }),
    }), [x, y]);
    return (
        <div
            ref={drop}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
            }}>
            <Square black={black}>{children}</Square>
            {isOver && !canDrop && <Overlay color='red' />}
            {!isOver && canDrop && <Overlay color='yellow' />}
            {isOver && canDrop && <Overlay color='green' />}
        </div >
    );
}

const Overlay = ({ color }) => {
    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '100%',
                zIndex: 1,
                opacity: 0.5,
                backgroundColor: color,
            }}
        />
    );
}
const Board = ({ knightPosition }) => {
    const squares = [];
    for (let i = 0; i < 64; i++) {
        squares.push(renderSquare(i, knightPosition));
    }
    return (
        <DndProvider backend={HTML5Backend}>
            <div style={{
                width: '100%',
                height: '500px',
                display: 'flex',
                flexWrap: 'wrap'
            }}>
                {squares}
            </div>
        </DndProvider>
    );
}
const Knight = () => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.KNIGHT,
        colelct: monitor => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));
    return (
        <span ref={drag}
            className={`block m-auto cursor-move text-center text-5xl opacity-${isDragging ? 50 : 100}`}>
            ♘
        </span>
    );
}

const Square = ({ black, children }) => {
    const fill = black ? 'black' : 'white'
    const stroke = black ? 'white' : 'black'

    return (
        <div
            style={{
                backgroundColor: fill,
                color: stroke,
                width: '100%',
                height: '100%',
            }}
        >
            {children}
        </div>
    )
};

export default Page;

let knightPosition = [1, 7]
let observer = null

const emitChange = () => {
    if (observer) {
        observer(knightPosition)
    }
}

const observe = (o) => {
    if (observer) {
        throw new Error('Multiple observers not implemented.')
    }
    observer = o
    emitChange()
}

const moveKnight = (toX, toY) => {
    knightPosition = [toX, toY]
    emitChange()
}

const canMoveKnight = (toX, toY) => {
    const [x, y] = knightPosition;
    const dx = toX - x;
    const dy = toY - y;
    return (
        (Math.abs(dx) === 2 && Math.abs(dy) === 1) ||
        (Math.abs(dx) === 1 && Math.abs(dy) === 2)
    );
}