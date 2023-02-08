"use strict";

const buttons_row = document.querySelector("#buttons");
const flashcard_div = document.querySelector("#flashcard");
const main_doc = {
	sheet_id: "15oOp0IXBcp0xBGd3upGuv0iBiOUgWXDqvxW3AAaT2r0",
	sheet_page: 0
};

let flashcards = [];
let indexes_to_answer = [];
let flashcard_index;
let to_answer_index;
let is_on_front = true;

async function getTsv(sheet_id, sheet_page) {
	const data = await fetch("https://docs.google.com/spreadsheets/d/" + sheet_id + "/export?gid=" + sheet_page + "&format=tsv");
	return await data.text();
}

function removeClickHandlers() {
	document.querySelectorAll("button").forEach(button => button.removeEventListener('click', startMenuClickHandler));
}

async function loadOptions(sheet_id, sheet_page) {
	removeClickHandlers();
	const tsv = await getTsv(sheet_id, sheet_page);
	const tsv_lines = tsv.split("\n");

	let options = [];

	tsv_lines.forEach(element => {
		const line_params = element.split('\t');

		let option = document.createElement("button");
		option.innerText = line_params[0];
		option.dataset.target_type = line_params[1];
		option.dataset.sheet_id = line_params[2];
		option.dataset.sheet_page = line_params[3];
		option.addEventListener('click', startMenuClickHandler);
		options.push(option);
	});

	buttons_row.replaceChildren(...options);
}

async function startMenuClickHandler(event) {
	if (event.target.dataset.target_type === "flashcards") return loadFlashcards(event.target.dataset.sheet_id, event.target.dataset.sheet_page);
	return loadOptions(event.target.dataset.sheet_id, event.target.dataset.sheet_page);
}

async function loadFlashcards(sheet_id, sheet_page) {
	removeClickHandlers();

	const tsv = await getTsv(sheet_id, sheet_page);
	const tsv_lines = tsv.split("\n");

	tsv_lines.forEach(tsv_line => {
		const params = tsv_line.split('\t');
		let flashcard = {};
		flashcard.type = params[0];
		flashcard.front = params[1];
		flashcard.back = params[2];
		flashcards.push(flashcard);
	});

	let wrong_button = document.createElement("button");
	wrong_button.classList.add("wrong");
	wrong_button.addEventListener('click', wrong);
	wrong_button.innerText = "Got it wrong";

	let toggle_button = document.createElement("button");
	toggle_button.classList.add("toggle");
	toggle_button.addEventListener('click', toggle);
	toggle_button.innerText = "Toggle";

	let right_button = document.createElement("button");
	right_button.classList.add("right");
	right_button.addEventListener('click', right);
	right_button.innerText = "Got it right";

	buttons_row.replaceChildren(wrong_button, toggle_button, right_button);
	
	indexes_to_answer = [...Array(flashcards.length).keys()];
	newQuestion();
}

function newQuestion() {
	to_answer_index = Math.floor(Math.random() * indexes_to_answer.length);
	flashcard_index = indexes_to_answer[to_answer_index];
	is_on_front = true;

	let element;
	if (flashcards[flashcard_index].type === "image") {
		element = document.createElement("img");
		element.src = flashcards[flashcard_index].front;
	} else {
		element = document.createElement("p");
		element.innerText = flashcards[flashcard_index].front;
	}
	flashcard_div.replaceChildren(element);
}

function wrong() {
	newQuestion();
}

function toggle() {
	let to_set;
	if (is_on_front)
		to_set = flashcards[flashcard_index].back
	else
		to_set = flashcards[flashcard_index].front
	
	is_on_front = !is_on_front;
	const element = flashcard_div.firstChild;
	if (flashcards[flashcard_index].type === "image")
		element.src = to_set;
	else
		element.innerText = to_set;
}

function right() {
	indexes_to_answer.splice(to_answer_index, 1);
	if (indexes_to_answer.length === 0) {
		alert("You have answered to all flashcards. They will be readded to the pool");
		indexes_to_answer = [...Array(flashcards.length).keys()];
	}
	newQuestion();
}

loadOptions(main_doc.sheet_id, main_doc.sheet_page);