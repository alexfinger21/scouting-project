import { consoleLog } from "../utility.js"
import Map from "./Map.js"
import PiecesMap from "./PiecesMap.js"
import RobotMap from "./RobotMap.js"
import Legend from "./Legend.js"
import RenderQueue from "./RenderQueue.js"
import CoralScreen from "./coral_screen/CoralScreen.js"
import AlgaeMap from "./AlgaeMap.js"
import Net from "./Net.js"
import FeederStation from "./FeederStation.js"
import Processor from "./Processor.js"
import Path from "./Path.js"

const helpText = `1. Drag robot approx. start pos
2. Click on reef to select where and which level piece was scored
3. add or remove steps as necessary in the action queue below` 

//return correct coral ge_key
const coral_ge_key = (level, letter, scored=true) => {
    return 20000 + level * 1000 + (letter.charCodeAt(0) - 65) * 10 + (scored == true ? 1 : 0)
}

const get_level = (ge_key) => {
    return String(ge_key)[1]
}

//get letter from coral ge_key
const get_letter = (ge_key) => {
    return String.fromCharCode(65 + Number(("" + ge_key).substring(2, 4)) )
}

//get row from coral ge_key
const get_row = (ge_key) => {
    return Number(("" + ge_key).substring(1, 2))
}

//get is scored from coral ge_key
const get_scored = (ge_key) => {
    return ge_key % 2
}
export default class Auton {
    /*ctx: canvas.getContext('2d')
    allianceColor: "R", "B" */
    constructor({ctx, allianceColor, data, images, cX, cY}) {
        this.canvasSize = {x: cX, y: cY}
        this.dpr = window.devicePixelRatio
        consoleLog("CTX SIZE", images, this.canvasSize)
        const isBlue = allianceColor == "B"
        this.ctx = ctx
        this.images = images
        this.renderQueue = new RenderQueue({ctx, canvasSize: this.canvasSize, dpr: this.dpr})
        this.map = new Map({ctx, renderQueue: this.renderQueue, allianceColor, img: images.mapImage, canvasSize: this.canvasSize})
        this.path = new Path({ ctx, path: {}, renderQueue: this.renderQueue, canvasSize: this.canvasSize })
        this.clickable = {}
        this.clickable.robots = new RobotMap({ctx, renderQueue: this.renderQueue, allianceColor, images, robotStartingPercent: data?.["Starting Location"], canvasSize: this.canvasSize})
        this.clickable.pieces = new PiecesMap({ctx, isAuton: true, renderQueue: this.renderQueue, allianceColor, img: "circle", canvasSize: this.canvasSize})
        this.clickable.algae = new AlgaeMap({ctx, isAuton: true, renderQueue: this.renderQueue, allianceColor, images: images, data: data?.algae, canvasSize: this.canvasSize})

        this.clickable.net = new Net({ctx, renderQueue: this.renderQueue, allianceColor, count: data?.auton?.net?.count, canvasSize: this.canvasSize,
            x: isBlue ? this.canvasSize.x * 0.05 : this.canvasSize.x * 0.85,
            y: isBlue ? this.canvasSize.y * 0.55 : this.canvasSize.y * 0.09  ,
        })
        
        this.clickable.feederTop = new FeederStation({ctx, canvasSize: this.canvasSize, count: data?.feederTop?.count, renderQueue: this.renderQueue,
            points: [
                {x: this.canvasSize.x * this.dpr * (isBlue ? 0.8 : 0.21), y: this.canvasSize.y * this.dpr * (isBlue ? 0.097 : 0.035)},
                {x: this.canvasSize.x * this.dpr * (isBlue ? 0.945 : 0.05), y: this.canvasSize.y * this.dpr * (isBlue ? 0.097 : 0.035)},
                {x: this.canvasSize.x * this.dpr * (isBlue ? 0.945 : 0.05), y: this.canvasSize.y * this.dpr * (isBlue ? 0.24 : 0.18)},
            ]
        })

        this.clickable.feederBottom = new FeederStation({ctx, canvasSize: this.canvasSize, count: data?.feederBottom?.count, renderQueue: this.renderQueue,
            points: [
                {x: this.canvasSize.x * this.dpr * (isBlue ? 0.8 : 0.21) , y: this.canvasSize.y * this.dpr* (isBlue ? 0.962 : 0.9)},
                {x: this.canvasSize.x * this.dpr * (isBlue ? 0.945 : 0.05), y: this.canvasSize.y * this.dpr * (isBlue ? 0.962 : 0.9) },
                {x: this.canvasSize.x * this.dpr * (isBlue ? 0.945 : 0.05), y: this.canvasSize.y * this.dpr * (isBlue ? 0.82 : 0.76)},
            ]
        })

        this.clickable.processor = new Processor({ctx, canvasSize: this.canvasSize, count: data?.auton?.processor?.count, renderQueue: this.renderQueue,
            x: this.canvasSize.x*(isBlue ? 0.135 : 0.685),
            y: this.canvasSize.y * (isBlue ? 0 : 0.89),
        })

        this.legend = new Legend({ctx, renderQueue: this.renderQueue, img: images.legendButton, canvasSize: this.canvasSize, text: helpText})
        this.clickable.coralScreens = {}

        for (let i = 0; i<12; ++i) {
            this.clickable.coralScreens[String.fromCharCode(65+i)] = new CoralScreen({ctx, renderQueue: this.renderQueue, allianceColor, letter: String.fromCharCode(65+i), data: data?.auton?.[String.fromCharCode(65+i)], images, canvasSize: this.canvasSize, zIndex: 10})
        }

        // Prevent text and image dragging globally
        document.addEventListener("dragstart", (event) => {
            if (event.target.tagName !== "TR") {
            event.preventDefault() 
            }
        })


        //create table

        this.trash = document.createElement("div")
        this.trash.id="trash"
        document.body.insertBefore(this.trash, document.getElementById("page-holder"))
        this.table = document.querySelector("#responsive-table table")
        this.table.ondragover = e => e.preventDefault()
        this.trows = []

        this.dragDeb = false
        this.draggingText = ""
        
        this.trash.draggable = true
        this.trash.ondragover = e => e.preventDefault()
        this.trash.ondragenter = e => {
            e.preventDefault()
            this.trash.classList.add("hover")
            this.dragRow.classList.add("remove")
        }
        this.trash.ondragleave = e => {
            e.preventDefault()
            this.trash.classList.remove("hover")
            this.dragRow.classList.remove("remove")
        }
        this.trash.ondrop = e => {
            e.preventDefault()
            this.removeTableRow({row: this.dragRow, ge_key: this.dragRow.getAttribute("ge_key")})
            this.dragDeb = true
            this.trash.classList.remove("show")
        }

        if (data?.auton?.path) {
            for (let step of data.auton.path.split("|")) {
                step = Number(step)
                if (step > 21000 && step < 30000) {
                    const ltr = get_letter(step)
                    const lvl = get_level(step)
                    const scr = get_scored(step)
                    this.addTableRow({text: `${scr ? "Score" : "Miss"} Coral ${ltr}L${lvl}`, ge_key: step, draggable: true}) 
                } else if (step == 2004) {
                    this.addTableRow({text: "Score Processor", ge_key: step, draggable: true})
                } else if (step == 2005) {
                    this.addTableRow({text: "Score Net", ge_key: step, draggable: true})
                } else if (step == 2006) {
                    this.addTableRow({text: "Feed Coral: Top", ge_key: step, draggable: true})
                } else if (step == 2007) {
                    this.addTableRow({text: "Feed Coral: Bottom", ge_key: step, draggable: true})
                } else if (step >= 2008 && step <= 2013) {
                    const label = String.fromCharCode(65 + (step - 2008)*2) + String.fromCharCode(65 + (step - 2008)*2 + 1)
                    this.addTableRow({text: "Dislodge " + label, ge_key: step, draggable: true})
                }
            }
        }
    }

    addTableRow({text, ge_key, draggable, position=-1}) {
        const row = this.table.insertRow(position)
        row.setAttribute("ge_key", ge_key)
        row.draggable = draggable
        const cell0 = row.insertCell(0)
        const img = document.createElement("img")
        img.src = (draggable ? this.images.draggableImage : this.images.lockImage).src
        img.draggable = false
        cell0.appendChild(img)
        const cell1 = row.insertCell(1)
        cell1.appendChild(document.createTextNode(text))

        if(draggable) {
            row.ondragstart = e => {
                this.dragRow = row
                this.draggingText = this.dragRow.getElementsByTagName("td")[1].innerText
                e.dataTransfer.dropEffect = "move"
                e.dataTransfer.effectAllowed = "move"
                e.dataTransfer.setData("text/html", row.innerHTML)
                this.trash.classList.add("show")
            }
    
            row.ondragover = e => {
                e.preventDefault()
            }
    
            row.ondrop = e => {
                e.preventDefault()
                row.innerHTML = e.dataTransfer.getData("text/html")
                this.dragDeb = true
            }
    
            row.ondragenter = e => {
                e.preventDefault()
                row.classList.add("hover")
                const a =  this.dragRow.getElementsByTagName("td")[1]
                const b =  row.getElementsByTagName("td")[1]
                a.innerText = b.innerText
                b.innerText = ""
                this.dragRow.getElementsByTagName("img")[0].style.visibility="visible"
                row.getElementsByTagName("img")[0].style.visibility="hidden"
                this.dragRow = row
            }
            row.ondragleave = e => {
                e.preventDefault()
                row.classList.remove("hover")
            }
            row.ondragend = (e) => {
                e.preventDefault()
                if(!this.dragDeb) {
                    const a =  this.dragRow.getElementsByTagName("td")[1]
                    a.innerText = this.draggingText
                    this.dragRow.getElementsByTagName("img")[0].style.visibility="visible"
                }
                this.dragDeb = false
                for (const r of this.trows) {
                    r.classList.remove("hover")
                    this.trash.classList.remove("show")
                    this.trash.classList.remove("hover")
                }
            }
        }
        this.trows.push(row)
    }

    /*finds table rows matching ge_key */
    findTableRows({ge_key}) {
        return [...this.trows].filter(e => e.getAttribute("ge_key") == ge_key)
    }

    /*removes last table row matching ge_key, or specific row matching ge_key if row field is given*/
    removeTableRow({row, ge_key}) {
        if(row == null) {
            const rows = this.findTableRows({ge_key})
            if(rows.length > 0) {
                row = rows.pop() //get last matching row
            }
            else {
                return false
            }
        }
        //remove row from this.trows array
        for(let i = 0; i < this.trows.length; ++i) {
            if(this.trows[i] == row) {
                this.trows.splice(i, 1)
            }
        }
        if(ge_key > 21000 && ge_key < 30000) { //if its coral
            //update data in corresponding coralscreen
            if(get_scored(ge_key) == true) {
                this.clickable.coralScreens[get_letter(ge_key)].clickAreas[get_row(ge_key)-1].scored -= 1
            }
            else {
                this.clickable.coralScreens[get_letter(ge_key)].clickAreas[get_row(ge_key)-1].missed -= 1
            }
        }  
        if(ge_key == 2004) {//processor
            this.clickable.processor.count--
        }
        if(ge_key == 2005) {//net
            this.clickable.net.count--
        }
        if(ge_key == 2006) {//net
            this.clickable.feederTop.count--
        }
        if(ge_key == 2007) {//net
            this.clickable.feederBottom.count--
        }
        if(ge_key >= 2008 && ge_key <= 2013) { //if its algae
            //update corresponding algae
            this.clickable.algae.algae[ge_key - 2008].isSelected = false
        }
        //delete row
        row.remove()
        return true
    }

    onClick({ x, y }) {
        // Collision detection between clicked offset and element.
        
        const menuOpen = Object.values(this.clickable.coralScreens).find(e => e.isSelected)
        consoleLog("menu open", menuOpen)
        if (!menuOpen) {
            this.clickable.robots.onClick({x, y})
            if(this.clickable.net.onClick({x, y}, false)) {
                this.addTableRow({text: "Score Net", ge_key: 2005, draggable: true})
            }
            this.legend.onClick({x, y})
            if(this.clickable.feederTop.onClick({x, y}, false)) {
                this.addTableRow({text: "Feed Coral: Top", ge_key: 2006, draggable: true})
            }
            if(this.clickable.feederBottom.onClick({x, y}, false)) {
                this.addTableRow({text: "Feed Coral: Bottom", ge_key: 2007, draggable: true})
            }
            if(this.clickable.processor.onClick({x, y}, false)) {
                this.addTableRow({text: "Score Processor", ge_key: 2004, draggable: true})
            }
            const cRes = this.clickable.pieces.onClick({x, y})
            if (cRes) {
                consoleLog("here hello")
                this.clickable.coralScreens[cRes.text].isSelected = true
            }

            const aRes = this.clickable.algae.onClick({x, y})
            if(aRes != false) {
                if(aRes.isSelected) {
                    const label = String.fromCharCode(65 + (aRes.ge_key - 2008)*2) + String.fromCharCode(65 + (aRes.ge_key - 2008)*2 + 1)
                    this.addTableRow({text: "Dislodge " + label, ge_key: aRes.ge_key, draggable: true})
                }
                else {
                    this.removeTableRow({ge_key: aRes.ge_key})
                }
            }
            
        } else {
            Object.values(this.clickable.coralScreens).forEach(e => {
                if(e.isSelected) {
                    const clicked = e.onClick({x, y}) 
                    consoleLog("clicked", clicked)
                    if(clicked ) {//proceed button was clicked
                        for(let i = 0; i < e.clickAreas.length; ++i) {
                            if (e.clickAreas[i].scored > this.findTableRows({ge_key: coral_ge_key(i+1, e.letter, true)}).length) { //if there are more scored in data than on the table
                                this.addTableRow({text: "Score Coral " + e.letter + "L" + (i+1), ge_key: coral_ge_key(i+1, e.letter, true), draggable: true})
                            }
                            if (e.clickAreas[i].missed > this.findTableRows({ge_key: coral_ge_key(i+1, e.letter, false)}).length) { //if there are more scored in data than on the table
                                this.addTableRow({text: "Miss Coral " + e.letter + "L" + (i+1), ge_key: coral_ge_key(i+1, e.letter, false), draggable: true })
                            }
                        }
                    }
                    consoleLog(this.sendData())
                }
            })
        }
    }

    onMouseDown({ x, y, event }) {
        this.clickable.robots.onMouseDown({x, y, event})
    }
    
    onMouseMove({ x, y, event}) {
        this.clickable.robots.onMouseMove({x, y, event})
    }

    onMouseUp({ x, y, event }) {
        this.clickable.robots.onMouseUp({x, y, event})
    }


    sendData() {
        const res = {}
        res["Starting Location"] = this.clickable.robots.sendData()["Starting Location"] ?? 0
        res.auton = {}
        
        for (const k of Object.keys(this.clickable.coralScreens)) {
            res.auton[k] = this.clickable.coralScreens[k].sendData()
        }

        res.feederTop = this.clickable.feederTop.sendData() 
        res.feederBottom = this.clickable.feederBottom.sendData() 

        res.auton.path = Array.from(this.table.children[1].children).slice(1).map(tr => tr.getAttribute("ge_key")).join('|')
        res.algae = this.clickable.algae.sendData()
        res.auton.net = this.clickable.net.sendData()
        res.auton.processor = this.clickable.processor.sendData()
        res.auton["algae-count"] = Object.values(res.algae).reduce((acc, cur) => {
            return acc + cur.isSelected ? 1 : 0
        }, 0)

        return res
    }

    #constructPosPath() {
        const path = Array.from(this.table.children[1].children).slice(1).map(tr => {
            const step = Number(tr.getAttribute("ge_key"))
            if (step > 21000 && step < 30000) {
                const ltr = get_letter(step)
                const ret = this.clickable.pieces.pieces.find(e => e.text == ltr)
                return {x: ret.x + ret.radius, y: ret.y + ret.radius}
            } else if (step == 2004) {
                const ret = this.clickable.processor
                return {x: ret.x + ret.sX/2, y: ret.y + ret.sY/2}
            } else if (step == 2005) {
                const ret = this.clickable.net
                return {x: ret.x + ret.sX/2, y: ret.y + ret.sY/2}
            } else if (step == 2006) {
                const ret = this.clickable.feederTop
                return {x: (ret.points[0].x + ret.points[2].x)/2/this.dpr, y: (ret.points[0].y + ret.points[2].y)/2/this.dpr}
            } else if (step == 2007) {
                const ret = this.clickable.feederBottom
                return {x: (ret.points[0].x + ret.points[2].x)/2/this.dpr, y: (ret.points[0].y + ret.points[2].y)/2/this.dpr}
            } else if (step >= 2008 && step <= 2013) {
                const ret = this.clickable.algae.algae.find(e => e.ge_key == step)
                return {x: ret.x + ret.sX/2, y: ret.y + ret.sY/2}
            }
        })

        path.unshift({x: this.clickable.robots.startPositions[0].x, y: this.clickable.robots.startPositions[0].y})
        return path

    }

    draw() {
        this.map.draw()
        this.path.path = this.#constructPosPath()
        this.path.draw()
        this.clickable.robots.draw()
        this.clickable.pieces.draw()
        this.clickable.algae.draw()
        this.clickable.net.draw()
        this.clickable.feederBottom.draw()
        this.clickable.feederTop.draw()
        this.clickable.processor.draw()

        this.legend.draw()
        Object.values(this.clickable.coralScreens).forEach(e => {
            e.draw()
            const ltr = this.clickable.pieces.pieces.find(p => p.text == e.letter)
            if (ltr.isSelected != e.isSelected) {
                ltr.lastTick = Date.now()
                ltr.isSelected = e.isSelected
            }
        })
    }
}
