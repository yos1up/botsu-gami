function isSolved(query){
	let numEnemy = 0
	for(let i=0;i<48;i++) numEnemy += query[i]
	let cost = 0
	let state = query.slice()
	for(let i=0;i<12;i++){
		for(let j=2;j<4;j++){ // 外側で「列揃い」を判定
			if (state[i*4+j]){
				for(let k=0;k<4;k++) state[i*4+k] = false
				cost++
				break
			}
		}
	}
	let rest = Array(12)
	for(let i=0;i<12;i++){
		rest[i] = false
		for(let j=0;j<2;j++){
			if (state[i*4+j]) rest[i] = true
		}
	}
	let startOffset = -1
	for(let i=0;i<12;i++){
		if (!rest[i]) {
			startOffset = i
			break
		}
	}
	if (startOffset === -1){
		cost += 6
	}else{
		for(let i=0;i<12;i++){
			if (rest[(i+startOffset)%12]){
				cost++
				i++
			}
		}
	}
	return (cost - 1) * 4 < numEnemy
}



function rotateInPlace(state, rad, ang){
	/*
		rad: 0, 1, 2, 3
		ang: 0, 1, 2, ..., 11
	*/
	let cache = Array(12)
	for(let i=0;i<12;i++) cache[i] = state[rad + i*4]
	for(let i=0;i<12;i++) state[rad + (i+ang)%12*4] = cache[i]
}

function slideInPlace(state, col, dist){
	/*
		col: 0, 1, 2, 3, 4, 5
		dist: 0, 1, ..., 7
	*/
	let cache = Array(8)
	for(let i=0;i<4;i++) cache[i] = state[(col+1) * 4 - 1 - i]
	for(let i=0;i<4;i++) cache[4 + i] = state[(col+6)%12 * 4 + i]
	for(let i=0;i<4;i++) state[(col+1) * 4 - 1 - i] = cache[(i + dist)%8]
	for(let i=0;i<4;i++) state[(col+6)%12 * 4 + i] = cache[(4 + i + dist)%8]
}

function moveInPlace(state, index){
	/* index: 0, ..., 95 */
	if (index < 48) rotateInPlace(state, index%4, Math.floor(index/4))
	else slideInPlace(state, index%6, Math.floor((index - 48)/6))
}

function getMoveExplanation(index){
	let message = ""
	if (index < 48){
		const rad = index%4
		const ang = Math.floor(index/4)
		message = [
			"最も内側のリングを",
			"内側から2番目のリングを",
			"外側から2番目のリングを",
			"最も外側のリングを",
		][rad]
		if (ang < 6){
			message += `反時計回りに ${ang} マス回す`
		}else{
			message += `時計回りに ${12 - ang} マス回す`
		}
	}else{
		const col = index%6
		let dist = Math.floor((index - 48)/6)
		message = `${5 - col}〜${6 - col} 時の方向の列を`
		if (dist < 4){
			message += ` ${dist} マス${[
				"上", "左上", "左", "左", "左下", "下"
			][col]}へ送る`
		}else{
			dist = 8 - dist
			message += ` ${dist} マス${[
				"下", "右下", "右", "右", "右上", "上"
			][col]}へ送る`
		}
	}
	return message
}

function isNontrivialMove(index){
	return !(index < 4 || (48 <= index && index < 54)) // 無意味な操作	
}

function isNormalizedOrder(idx1, idx2){
	if (idx1 < 48 && idx2 < 48){
		const rad1 = idx1 % 4
		const rad2 = idx2 % 4
		return rad1 < rad2
	}else if (idx1 >= 48 && idx2 >= 48){
		const col1 = idx1 % 6
		const col2 = idx2 % 6
		return col1 < col2
	}
	return true
}

function findSolution(query){
	/* メインの解く関数 */
	const initialState = query.slice() // deep copy

	// 0 手詰
	if (isSolved(query)) return []

	// 1 手詰
	for(let i=0;i<96;i++){
		if (!isNontrivialMove(i)) continue
		query = initialState.slice()
		moveInPlace(query, i)
		if (isSolved(query)) return [i]
	}

	// 2 手詰
	for(let i=0;i<96;i++){
		if (!isNontrivialMove(i)) continue
		for(let j=0;j<96;j++){
			if (!isNontrivialMove(j)) continue
			if (!isNormalizedOrder(i, j)) continue
			query = initialState.slice()
			moveInPlace(query, i)
			moveInPlace(query, j)
			if (isSolved(query)) return [i, j]
		}
	}

	// 3 手詰
	for(let i=0;i<96;i++){
		if (!isNontrivialMove(i)) continue
		for(let j=0;j<96;j++){
			if (!isNontrivialMove(j)) continue
			if (!isNormalizedOrder(i, j)) continue
			for(let k=0;k<96;k++){
				if (!isNontrivialMove(k)) continue				
				if (!isNormalizedOrder(j, k)) continue
				query = initialState.slice()
				moveInPlace(query, i)
				moveInPlace(query, j)
				moveInPlace(query, k)
				if (isSolved(query)) return [i, j, k]
			}
		}
	}

	return null
}

function onClickSolve(){
	let query = target.getButtonState()

	const result = findSolution(query)
	
	let message = ""
	if (result === null){
		message = "3手以内では整列できない"
	}else{
		if (result.length === 0){
			message = "何もしないでOK"
		}else{
			message = result.map(getMoveExplanation).join("\n")
		}
	}
	document.getElementById("ta-main").value = message
}

function onClickClear(){
	/*for(let i=0;i<48;i++){
		document.getElementById("c" + i).checked = false
	}*/
	target.resetState()
	document.getElementById("ta-main").value = ""
}


// TODO: React component 化できるとかっこいい
class Target {
	constructor(){
		// svg の path に onclick を設定して回る
		const isTouchDevice = !( window.ontouchstart!==null )
		for(let i=0;i<48;i++){
			let elem = document.getElementById(`t${i}`)
			if (elem){
				if (isTouchDevice){
					elem.ontouchend = (() => this.onClickTarget(i))
				}else{
					elem.onclick = (() => this.onClickTarget(i))
				}
			}
		}
		this.resetState()
	}
	onClickTarget(index){
		this.buttonState[index] = (this.buttonState[index] + 1) % 2
		this.redraw(index)
	}
	redraw(index){
		let elem = document.getElementById(`t${index}`)
		if (elem){
			elem.style.stroke = "black"
			elem.style.fill = ["#ccccaa", "#cc44ee"][this.buttonState[index]]
		}
	}
	getButtonState(){
		return this.buttonState.slice() // deep copy
	}
	resetState(){
		this.buttonState = new Array(48).fill(0)		
		for(let i=0;i<48;i++) this.redraw(i)
	}
}

let target = null

function onLoad(){
	target = new Target()
}




