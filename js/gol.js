/**!
 MIT License

 Copyright (c) 2017 Gregory Jackson

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

(function (window) {
    'use strict';

    class Cell {
        constructor() {
            this.alive = false;
            this.nextState = null;
            this.neighbours = [];
            this.element = document.createElement('div');
            this.setElementState();
        }

        addNeighbours(neighbouringCells) {
            if (!Array.isArray(neighbouringCells)) {
                throw 'Cell: Array expected.';
            }

            this.neighbours = this.neighbours.concat(neighbouringCells);
        }

        setElementState() {
            this.element.className = this.alive ? 'cell alive' : 'cell dead';
        }

        setState(newState) {
            this.alive = newState;
            this.setElementState();
        }

        calculateNextState() {
            let aliveNeighbours = this.neighbours.reduce((accumulator, cell) => {
                return accumulator + (cell.alive ? 1 : 0);
            }, 0);

            this.nextState = this.alive ? aliveNeighbours >= 2 && aliveNeighbours < 4 : aliveNeighbours === 3;
        }

        moveToNextState() {
            this.alive = this.nextState;
            this.setElementState();
        }
    }


    class Grid {
        constructor(x, y, gridElement) {
            this.x = x;
            this.y = y;
            this.grid = [];
            this.gridElement = gridElement;
            this.contuously = false;

            this.generateGrid().renderGrid();
        }

        generateGrid() {
            for (let y = 0; y < this.y; y += 1) {
                let row = [];
                for (let x = 0; x < this.x; x += 1) {
                    row.push(new Cell(x, y));
                }
                this.grid.push(row);
            }

            this.setNeighbours();

            return this;
        }

        setNeighbours() {
            this.grid.forEach((row, ri) => {
                row.forEach((cell, ci) => {
                    let neighbours = [];

                    neighbours.push(this.grid[ri === 0 ? this.y - 1 : ri - 1][ci === 0 ? this.x - 1 : ci - 1]);
                    neighbours.push(this.grid[ri === 0 ? this.y - 1 : ri - 1][ci]);
                    neighbours.push(this.grid[ri === 0 ? this.y - 1 : ri - 1][ci + 1 === this.x ? 0 : ci + 1]);

                    neighbours.push(this.grid[ri][ci === 0 ? this.x - 1 : ci - 1]);
                    neighbours.push(this.grid[ri][ci + 1 === this.x ? 0 : ci + 1]);

                    neighbours.push(this.grid[ri + 1 === this.y ? 0 : ri + 1][ci === 0 ? this.x - 1 : ci - 1]);
                    neighbours.push(this.grid[ri + 1 === this.y ? 0 : ri + 1][ci]);
                    neighbours.push(this.grid[ri + 1 === this.y ? 0 : ri + 1][ci + 1 === this.x ? 0 : ci + 1]);

                    cell.addNeighbours(neighbours);
                });
            });
        }

        renderGrid() {
            this.gridElement.innerHTML = '';
            this.gridElement.style.width = (this.x * 4) + 'px';
            this.gridElement.style.height = (this.y * 4) + 'px';

            this.grid.forEach(row => row.forEach(cell => this.gridElement.appendChild(cell.element)));
        }

        runThroughGrid(fn) {
            this.grid.forEach(row => row.forEach(cell => fn(cell)));
        }

        randomize() {
            this.runThroughGrid(cell => cell.setState(Math.random() > 0.75));
        }

        runLifeCycle() {
            this.runThroughGrid(cell => cell.calculateNextState());
            this.runThroughGrid(cell => cell.moveToNextState());

            if (this.contuously) {
                window.setTimeout(() => this.runLifeCycle(), 25);
            }
        }

        runContuously() {
            this.contuously = true;

            this.runLifeCycle();
        }

        stop() {
            this.contuously = false;
        }
    }

    window.Grid = Grid;

})(window);


(function (window, Grid) {
    'use strict';

    let grid;

    grid = new Grid(100, 100, document.getElementById('gol'));

    grid.randomize();

    document.getElementById('random').addEventListener('click', () => grid.randomize(), false);
    document.getElementById('runLife').addEventListener('click', () => grid.runLifeCycle(), false);
    document.getElementById('runCont').addEventListener('click', () => grid.runContuously(), false);
    document.getElementById('stop').addEventListener('click', () => grid.stop(), false);

})(window, window.Grid);
