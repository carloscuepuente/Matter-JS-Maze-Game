const randomNumber = function (min, max) {
    const result = Math.floor((Math.random() * (max - min + 1)) + min);
    return result
};

const shuffleArray = (arr) => {
    let counter = arr.length; //vamos a hacer esto una vez por elemento del array

    while (counter > 0) {
        const randomIndex = Math.floor(Math.random() * counter); //nos da un indice random que este dentro de nuestro array

        counter--; //disminuimos el counter para que en while no sea infinito

        // swapeamos los elementos del array haciendo uso de una variable temporal
        const temp = arr[counter]; // temp contiene el elemento del array en el indice counter
        arr[counter] = arr[randomIndex]; // ahora el array en counter fue "sobre escrito" con lo que contenia el array en randomIndex
        arr[randomIndex] = temp; // y el array en randomIndex fue "sobre escrito" con lo que contenia temp

        // hacemos esto hasta que counter sea 0
    };

    // regresamos el array que resulte
    return arr;
}

// de la libreria de Matter js que metimos en el scrip de cdn
const { Engine, Render, Runner, World, Bodies, Body, Events, MouseConstraint, Mouse } = Matter;

// World: Objeto que contiene todos las diferentes cosas en nuestra matter app
// Engine: reads in the current state of the world from the world object, then calculates changes in positions of all the different shapes
// Runner: gtes the engine an world to work together, runs about 60 times per second
// Render: whenever the engine processes an update, Render will take a look at all the differente shapes ans show them on the screen
// Body: A shape that we are displaying can be a circle, rectangle oval etc

// crear una nueva engine
const engine = Engine.create();
// desactivar la gravedad en y

engine.world.gravity.y = 0


// cuando creas una engine viene con un worl asociado por lo que se puede desestructurar
const { world } = engine;

// variables originales para un laberinto cuadrado
// const cells = 5; //hace referencia a las celdas que va a tener nuesto laberinto cuadrado, por lo que por ahora no importa en que direccion se "muevan" esas celdas
// const width = 600;
// const height = 600;
// const unitLength = width / cells //cada celda que creemos sera tantas unidades de alto y largo

// variables para un laberinto rectangular que ocupe toda la pantalla
const cellsHorizontal = 10;
const cellsVertical = 8;
const width = window.innerWidth;
const height = window.innerHeight;
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;



const render = Render.create({
    element: document.body, //no destruye el body acural si no que mas bien agrega uun elemento de esos al body del html
    engine: engine,
    options: {
        wireframes: false,
        width, //en pixeles
        height,
    }
});

// correr el renderer para que muestre los objetos del mundo
Render.run(render)

// y corremos el runeer que es el que coordina las cosas de un estado A a un estado B
Runner.run(Runner.create(), engine)

const mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    })

World.add(world, mouseConstraint)



const walls = [
    Bodies.rectangle(width / 2, 0, width, 5, { isStatic: true }), //top
    Bodies.rectangle(width / 2, height, width, 5, { isStatic: true }), //bottom
    Bodies.rectangle(0, height / 2, 5, height, { isStatic: true }), //left
    Bodies.rectangle(width, height / 2, 5, height, { isStatic: true }), //rigth
]

World.add(world, walls)

// rundown de como es el algoritmo 
// 1 se crea una grilla de celdas
// 2 se elige una celda aleatoria para empezar
// 3 para ese celda se construye una lista ordenada de vecinos aleatoriamente
// 4 si un vecino ya ha sido visitado se borra de esa lista
// 5 para cada vecino que quede nos movemos a el y borramos la pared entre esas dos celdas
// 6 se repite este proceso para este nuevo vecino


// maze generation

// const grid = [];
// for (let i = 0; i < 3; i++) {
//     // mete en i un array vacio
//     grid.push([])
//     for (let j = 0; j < 3; j++) {
//         // mete en el array en la posicion i un false
//         grid[i].push(false)
//     }
// };

// pero es mejor hacerlo asi

const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

// console.log(grid)

// hay que recordad que vamos a crear dos estructuras de datos mas, que son las de los verticales y la de los horizontales
// la de verticales va a llevar la cuenta de las paredes verticales que quedan y que ya hemos cruzado
// la de horizontales va a hacer lo mismo pero con las paredes horizontales

const verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizontal).fill(false));


// console.log(grid)
// console.log(verticals)
// console.log(horizontals)

// elegir una celda aleatoria para empezar

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

// console.log(startRow, startColumn)

// funcion que hace el algoritmo antes descrito de visitar a los vecinos y ver si ya ha estado por ahi

// console.log(grid)
const visitaVecino = (row, column) => {
    // si he visitado la celda en [row, column] return porque no hay nada que hacer
    if (grid[row][column]) {
        return;
    };

    // marca la celda como visitada
    if (!grid[row][column]) {
        grid[row][column] = true;
    };

    // CREA LA LISTA ALEATORIA DE VECINOS

    // se puede creear rapidamente los vecinos si pensamos que movernos para arriba es a las filas le restamos 1 y seguimos en la misma columna
    // derecha es columna +1 misma fila
    // abajo es fila +1 misma columna
    // izquierda es columna - 1  misma fila

    const vecinos = shuffleArray([
        [row - 1, column, "up"], //arriba
        [row, column + 1, "right"], //derecha
        [row + 1, column, "down"], //abajo
        [row, column - 1, "left"] //izquierda
    ]);

    // para cada vecino haz...
    for (let vecino of vecinos) {

        const [nextRow, nextColumn, direction] = vecino;

        // chequea que ese vecino no este fuera de los limites de las celdas
        // si las coordenadas estan fuera de las dimensiones realies del laberinto, o una de ellas es menor a 0 o es mayor a la cantidad de filas o columnas que tiene
        if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
            // si esta fuere de limites no hagas nada con ese vecino, continua con el siguiente en el for of
            continue;
        };

        // si has visitado ese vecino, muevete al siguiente
        if (grid[nextRow][nextColumn]) {
            continue;
        };

        // borra una pared de las verticales o las horizontales dependiendo de si te mueves para arriba o para abajo
        if (direction === "left") {
            // di nos movemos a la izquierda el array vertical estamos en la vertical[row] es decir donde estamos y la siguiente coordenada es o 0 o 1 por las dimensiones del array
            // si solo si pensamos en un 3x3
            // verticals = [
            //     [false, false],
            //     [false, false],
            //     [false, false],
            // ]
            verticals[row][column - 1] = true;

        } else if (direction === "right") {
            verticals[row][column] = true

        } else if (direction === "up") {
            // si nos movemos hacia arriba o hacia abajo actualizaremos el array de horizontals
            // si solo nos podemos mover en una u otra direccion entonces las columnas siempre seran iguales y cambiaran las filas
            // si vamos para arriba tendremos que actualizar el horizontal[][column] y la coordenada primera dependera de si es para arriba o para abajo
            // horizontals = [
            //     [false, false, false]
            //     [false, false, false]
            // ]
            horizontals[row - 1][column] = true;
        } else if (direction === "down") {
            horizontals[row][column] = true
        }

        visitaVecino(nextRow, nextColumn)
    }

    // visita la siguiente celda aka llama a esta funcion con las celdas que tienes



};

visitaVecino(startRow, startColumn);
// visitaVecino(1, 1);
// console.log(grid[startRow][startColumn])


// para dibujar las paredes horizontales debemos ver al array de horizontals
// dentro de ese array habra tantos pisos como pisos tenga el laberinto
// y debemos recorrerlos todos por lo que haremos un forEach

horizontals.forEach((piso, indexPiso) => {
    // console.log(piso)
    piso.forEach((open, indexCelda) => {
        if (open) {
            return;
        }
        // los valores en x,y donde se va a poner el rectangulo son una funcion del tamaño de la celda y de su posicion dentro del array de horizontals
        const horizontalwall = Bodies.rectangle(indexCelda * unitLengthX + unitLengthX / 2, //posicion en x
            unitLengthY + unitLengthY * indexPiso, //posicion en y
            unitLengthX, //largo del rectangulo
            10, //alto del rectangulo
            {
                isStatic: true,
                label: "horizontalWall",
                render: {
                    fillStyle: "gray"
                }
            })
        World.add(world, horizontalwall)
    })
});

verticals.forEach((piso, indexPiso) => {

    piso.forEach((open, indexPilar) => {
        if (open) {
            return;
        }
        const verticalWall = Bodies.rectangle(
            unitLengthX + unitLengthX * indexPilar,
            indexPiso * unitLengthY + unitLengthY / 2,
            10,
            unitLengthY,
            {
                isStatic: true,
                label: "verticalWall",
                render: {
                    fillStyle: "gray"
                }
            })
        World.add(world, verticalWall)
    })
});

// const goal = Bodies.rectangle(
//     cells * unitLength - unitLength / 2,
//     cells * unitLength - unitLength / 2,
//     unitLength / cells,
//     unitLength / cells,
//     { isStatic: true }
// );

// GOAL SQUARE
const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * 0.70, //llene el 70% de una unidad de celda
    unitLengthY * 0.70,
    {
        isStatic: true,
        label: "goal",
        render: {
            fillStyle: "red"
        }
    }
);

World.add(world, goal)


// BALL PLAYER

const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, (Math.min(unitLengthX, unitLengthY) / 2) * 0.70, { label: "ball", render: { fillStyle: "green" } })

World.add(world, ball);

document.addEventListener("keydown", (event) => {
    const { x, y } = ball.velocity; //desestructurar  la velocidad en x y en y de la forma
    const speedLimit = 10;

    if (event.keyCode === 87) {
        // w up
        // console.log(ball.velocity)
        Body.setVelocity(ball, { x: x, y: Math.max(y - 2, -speedLimit) })
    }
    if (event.keyCode === 83) {
        // 83 down
        Body.setVelocity(ball, { x: x, y: Math.min(y + 2, speedLimit) })
        // console.log(ball.velocity)

    }
    if (event.keyCode === 65) {
        // 65 izq
        Body.setVelocity(ball, { x: Math.max(x - 1, -speedLimit), y: y })
        // console.log(ball.velocity)
    }
    if (event.keyCode === 68) {
        // 68 der
        Body.setVelocity(ball, { x: Math.min(x + 1, speedLimit), y: y })
        // console.log(ball.velocity)
    }
});

// win condition
Events.on(engine, "collisionStart", (event) => {
    // la funcion callback es llamada cada vez que hay una colision en el mundo
    // la forma como matterjs usa el event es que solo tiene uno y cada vez que pasa algo agrega cosas al evento pero una vez que el evento de acaba los borra
    // por eso el console.log de abajo en el array pairs aparece sin nada, porque habia algo ahi pero matterjs lo borro
    // console.log(event)

    // por eso vamos a iterar sobre el array pairs que tiene el event de matterjs
    event.pairs.forEach((collision) => {

        // console.log(collision)

        const { bodyA, bodyB } = collision
        // console.log(bodyA, bodyB)

        if (bodyB.label === "goal" || bodyA.label === "goal") {
            // cuando el jugador gana restauramos la gravedad y volvemos todas las piezas no estaticas
            engine.world.gravity.y = 1
            // console.log(world.bodies)
            const allBodies = world.bodies
            allBodies.forEach((bodie) => {
                if (bodie.label === "verticalWall" || bodie.label === "horizontalWall" || bodie.label === "goal") {
                    // bodie.isStatic = false esto da muchos errores y los cuerpos desaparecen
                    Body.setStatic(bodie, false)
                }
            })
            Body.setVelocity(ball, { x: ball.velocity.x = 0, y: ball.velocity.y = 0 })



            document.querySelector(".win-message").classList.remove("hidden");
        }
    });

});




