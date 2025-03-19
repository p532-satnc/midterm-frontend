let selectedQuestions = [];
let currentQuiz = [];
let currentQuestionIndex = 0;
let correctAnswersCount = 0;


function saveQuestion() {
    // Get the values from the input fields
    let description = document.getElementById("question-text").value;
    let choice1 = document.getElementById("choice1").value;
    let choice2 = document.getElementById("choice2").value;
    let choice3 = document.getElementById("choice3").value;
    let answer = document.getElementById("Answer").value;
    let imagePath = document.getElementById("question-image").files[0].name;

    if (!description || !choice1 || !choice2 || !choice3 || !answer || !imagePath) {
        alert("Please fill in all fields.");
        return;
    }

    const questionData = {
            description: description,
            choices: [choice1, choice2, choice3],
            answer: answer,
            imagePath: "images/" + imagePath
        };

    console.log("Sending Question Data:", JSON.stringify(questionData));


    fetch("https://demo-latest-a4zm.onrender.com/questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(questionData)
            })
            .then(response => {
            if (!response.ok) {
                        throw new Error("Failed to save question");
                    }
                    return response.json();  // Parse JSON response
                })
            .then(data =>{

                alert("Question added successfully!");
                })
            .catch(error => {
                console.error("Error saving question:", error);
                alert("Error adding question. Please try again.");
            });
        }


function saveQuiz() {
    let quizTitle = document.getElementById("quiz-title").value;
    if (!quizTitle) {
        alert("Please enter a quiz title.");
        return;
    }

    let quizData = {
            title: quizTitle,
            questions: selectedQuestions.map(q => ({
                id: q.id,
                description: q.description,
                choices: q.choices,
                answer: q.answer,
                imagePath: q.imagePath
            })),
            questionIds: selectedQuestions.map(q => q.id)
        };

    console.log("Quiz Data to be sent:", quizData);

    fetch("https://demo-latest-a4zm.onrender.com/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizData)
    }).then(() => alert("Quiz Saved!"))
    .catch(error => console.error("Error saving quiz:", error));;
}

function saveAndNewQuiz() {
    saveQuiz();
    selectedQuestions = [];
    updateSelectedQuestions();
    document.getElementById("quiz-title").value = "";
}

function loadQuestions() {
fetch("https://demo-latest-a4zm.onrender.com/questions")  // GET request to fetch all questions from the backend
        .then(response => response.json())
        .then(questions => {

    let questionList = document.getElementById("questions-list");
    if (!questionList) return;

    questionList.innerHTML = "";

    questions.forEach(q => {
        let card = document.createElement("div");
        card.id = "question-card"
        card.classList.add("child");
        card.innerHTML = `
            <p><strong>id:</strong> ${q.id}</p>
            <p><strong>description:</strong> ${q.description}</p>
            <p><strong>choices:</strong> ${q.choices.join(", ")}</p>
            <img src="https://p532-satnc.github.io/midterm-frontend/${q.imagePath}" alt="Question Image" class="question-image">
            <button onclick="addToQuiz(${q.id})">Add</button>
        `;
        console.log(`Adding question with ID: ${q.id}`);
        console.log(typeof q.id);
        questionList.appendChild(card);
    });
    })
    .catch(error => console.error("Error loading questions:", error));
}

// Add question to selected quiz
function addToQuiz(id) {
    console.log("Adding question with ID:", id);
    console.log(typeof id);
    fetch(`https://demo-latest-a4zm.onrender.com/questions/${id}`) // GET request to fetch a specific question by ID
            .then(response => response.json())
            .then(question => {

//    let question = questionList.find(q => q.id === id);
    if (!selectedQuestions.some(q => q.id === id)) {
        selectedQuestions.push(question);
        updateSelectedQuestions();
        saveQuiz();
    }
    })
    .catch(error => console.error("Error adding question to quiz:", error));
}

function updateSelectedQuestions() {
    let container = document.getElementById("selected-questions");
    if (!container) return;

    container.innerHTML = "";
    selectedQuestions.forEach(q => {
        let card = document.createElement("div");
        card.classList.add("question-card-right");
        card.innerHTML = `
            <p><strong>id:</strong> ${q.id}</p>
            <p><strong>description:</strong> ${q.description}</p>
            <p><strong>choices:</strong> ${q.choices.join(", ")}</p>
            <img src="https://p532-satnc.github.io/midterm-frontend/${q.imagePath}" alt="Question Image" class="question-image">
            <button onclick="removeFromQuiz(${q.id})">Remove</button>
        `;
        container.appendChild(card);
    });
}

function removeFromQuiz(id) {
    selectedQuestions = selectedQuestions.filter(q => q.id !== id);
    updateSelectedQuestions();
}

// Load quizzes for the quiz selection page
function loadQuizzes() {

fetch("https://demo-latest-a4zm.onrender.com/quizzes")  // GET request to fetch all quizzes from the backend
        .then(response => response.json())
        .then(quizzes => {

    let quizList = document.getElementById("quiz-list");
    if (!quizList) return;

    quizList.innerHTML = "";

    quizzes.forEach(q => {
        let quizItem = document.createElement("div");
        quizItem.classList.add("quiz-item");
        quizItem.innerHTML = `<p>${q.title}</p><button onclick="startQuiz(${q.id})">Take Quiz</button>`;
        quizList.appendChild(quizItem);
    });
    })
    .catch(error => console.error("Error loading quizzes:", error));
}

function startQuiz(id) {
    window.location.href = `quiz-play.html?quizId=${id}`;
}

function loadQuiz() {
    let urlParams = new URLSearchParams(window.location.search);
    let quizId = urlParams.get("quizId");
    console.log(quizId);
    if (!quizId) return;

    fetch(`https://demo-latest-a4zm.onrender.com/quizzes/${quizId}`)
            .then(response => response.json())
            .then(quiz => {
    currentQuiz = quiz;
    currentQuestionIndex = 0;
    correctAnswersCount = 0;
    console.log(currentQuiz);
    displayQuestion();
    })
    .catch(error => console.error("Error loading quiz:", error));
}


// Display current quiz question
function displayQuestion() {
    if (currentQuestionIndex < 0 || currentQuestionIndex >= currentQuiz.questions.length) {
        console.error("Invalid question index:", currentQuestionIndex);
        return;
    }


    let question = currentQuiz.questions[currentQuestionIndex];
    console.log("Current Question:", question);


    document.getElementById("question-text").textContent = question.description;


    document.getElementById("question-image").src = question.imagePath;

    let optionsContainer = document.getElementById("options");
    optionsContainer.innerHTML = ""; // Clear previous options

    console.log("Current Question Answer:", question.answer);
    if (Array.isArray(question.choices)) {
        question.choices.forEach(choice => {
            let button = document.createElement("button");
            button.textContent = choice;
            button.onclick = () => checkAnswer(choice,question.answer);
            optionsContainer.appendChild(button);
        });
    } else {
        console.error("Choices are not in the expected format:", question.choices);
    }


    console.log("Options container updated:", optionsContainer);


    document.getElementById("prev-btn").style.display = currentQuestionIndex === 0 ? "none" : "inline-block";
}



// Check the selected answer
function checkAnswer(selected, correct) {

    const isCorrect = selected.trim() === correct.trim();
    if (isCorrect) {
            correctAnswersCount++;
        }
    alert(isCorrect ? "Correct!" : "Wrong!");

    setTimeout(() => {

            currentQuestionIndex++;


            if (currentQuestionIndex < currentQuiz.questions.length) {
                displayQuestion();
            } else {

                showQuizResult();

            }
        }, 1000);
}

// Navigate to previous question
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

// Navigate to next question
function nextQuestion() {
//    console.log(currentQuestionIndex);
//    console.log(currentQuiz.questions.length);
    if (currentQuestionIndex < currentQuiz.questions.length-1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        showQuizResult();
    }
}

function showQuizResult() {

    document.getElementById("quiz-content").style.display = "none";
    document.getElementById("prev-btn").style.display = "none";
    document.getElementById("next-btn").style.display = "none";

    const quizContainer = document.getElementById("quiz-container");
    if (!quizContainer) {
            console.error("Error: Quiz container not found!");
            return;
        }
    const resultSection = document.createElement("div");
    resultSection.id = "quiz-result";
    resultSection.innerHTML = `
            <h3>Quiz Completed!</h3>
            <p>You answered ${correctAnswersCount} out of ${currentQuiz.questions.length} questions correctly.</p>
            <button onclick="goToTakeQuiz()">Back to Take Quiz</button>
        `;

        quizContainer.appendChild(resultSection);
    }

function goToTakeQuiz() {
    window.location.href = "take-quiz.html";
}
