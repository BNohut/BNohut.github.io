// Register service worker
if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(registration => {
        console.log('Service worker registered with scope:', registration.scope);
    }).catch(err => {
        console.log('Service worker registration failed:', err);
    });
} 

$(document).ready(function() {

    const apiUrl = 'https://jsonplaceholder.typicode.com/';
    const loadingScreen = document.getElementById('loadingScreen');

    let selectedConsultant = null;
    let selectedDepartment = null;
    let completedSurveys = new Set(); // Track completed surveys
    let currentSurveyId = null; // Track current survey ID
    let inactivityTimer = null; // Track inactivity timer
    const INACTIVITY_TIMEOUT = 0.5 * 60 * 1000; // 5 minutes in milliseconds

    function resetInactivityTimer() {
        // Clear existing timer if any
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
        }

        // Set new timer
        inactivityTimer = setTimeout(() => {
            const surveysScreen = document.getElementById('surveysScreen');
            const questionsScreen = document.getElementById('questionsScreen');
            
            // Check if either screen is visible
            if (!surveysScreen.classList.contains('hidden') || !questionsScreen.classList.contains('hidden')) {
                console.log('Inactivity detected, resetting process...');
                resetProcess();
            }
        }, INACTIVITY_TIMEOUT);
    }

    function resetProcess() {
        // Clear completed surveys
        completedSurveys.clear();
        
        // Reset screens
        const mainScreen = document.getElementById('mainScreen');
        const surveysScreen = document.getElementById('surveysScreen');
        const questionsScreen = document.getElementById('questionsScreen');
        const thanksScreen = document.getElementById('thanksScreen');
        
        // Hide all screens except main
        mainScreen.classList.remove('hidden');
        surveysScreen.classList.add('hidden');
        surveysScreen.classList.add('d-none');
        questionsScreen.classList.add('hidden');
        thanksScreen.classList.add('hidden');
        
        // Clear any existing answers
        if (window.answers) {
            window.answers = {};
        }
        
        console.log('Process reset due to inactivity');
    }

    function returnToMainScreen() {
        const thanksScreen = document.getElementById('thanksScreen');
        const mainScreen = document.getElementById('mainScreen');
        const infoScreen = document.getElementById('infoScreen');
        const departmentSelect = document.getElementById('departmentSelect');
        const consultantSelect = document.getElementById('consultantSelect');
        
        // Safely handle screen visibility
        if (thanksScreen) thanksScreen.classList.add('hidden');
        if (mainScreen) mainScreen.classList.remove('hidden');
        if (infoScreen) infoScreen.classList.add('hidden');
        
        // Safely handle select values
        if (departmentSelect && selectedDepartment) {
            departmentSelect.value = selectedDepartment;
        }
        if (consultantSelect && selectedConsultant) {
            consultantSelect.value = selectedConsultant;
        }

        // Reset the survey screen
        const surveysScreen = document.getElementById('surveysScreen');
        if (surveysScreen) {
            surveysScreen.classList.add('hidden');
            surveysScreen.classList.add('d-none');
        }

        // Reset the questions screen
        const questionsScreen = document.getElementById('questionsScreen');
        if (questionsScreen) {
            questionsScreen.classList.add('hidden');
        }

        // Reset completed surveys when returning to main screen
        completedSurveys.clear();

        console.log('Returned to main screen');
        console.log('Selected department:', selectedDepartment);
        console.log('Selected consultant:', selectedConsultant);
    }

    function getConsultants() {
        const consultants = [
            {
                id: 1,
                name: 'Danışman 1'
            },
            {
                id: 2,
                name: 'Danışman 2'
            },
            {
                id: 3,
                name: 'Danışman 3'
            },
        ]
        const consultantSelect = document.getElementById('consultantSelect');
        consultantSelect.innerHTML = '<option value="" disabled selected>Danışman Seçiniz</option>';
        consultants.forEach(consultant => {
            const option = document.createElement('option');
            option.value = consultant.id;
            option.textContent = consultant.name;
            consultantSelect.appendChild(option);
        });
        // $.ajax({
        //     url: apiUrl + 'users',
        //     type: 'GET',
        //     success: function(response) {
        //         const consultantSelect = document.getElementById('consultantSelect');
        //         consultantSelect.innerHTML = '<option value="" disabled selected>Danışman Seçiniz</option>';
        //         response.forEach(consultant => {
        //             const option = document.createElement('option');
        //             option.value = consultant.id;
        //             option.textContent = consultant.name;
        //             consultantSelect.appendChild(option);
        //         });
        //     },
        //     error: function(xhr, status, error) {
        //         console.error('Error fetching consultants:', error);
        //     }
        // });
    }

    function getDepartments() {
        const departments = [
            {
                id: 1,
                name: 'Departman 1'
            },
            {
                id: 2,
                name: 'Departman 2'
            }
        ];
        const departmentSelect = document.getElementById('departmentSelect');
        departmentSelect.innerHTML = '<option value="" disabled selected>Departman Seçiniz</option>';
        departments.forEach(department => {
            const option = document.createElement('option');
            option.value = department.id;
            option.textContent = department.name;
            departmentSelect.appendChild(option);
        });
        // $.ajax({
        //     url: apiUrl + 'departments',
        //     type: 'GET',
        //     success: function(response) {
        //         const departmentSelect = document.getElementById('departmentSelect');
        //         departmentSelect.innerHTML = '<option value="" disabled selected>Departman Seçiniz</option>';
        //         response.forEach(department => {
        //             const option = document.createElement('option');
        //             option.value = department.id;
        //             option.textContent = department.name;
        //             departmentSelect.appendChild(option);
        //         });
        //     },
        //     error: function(xhr, status, error) {
        //         console.error('Error fetching departments:', error);
        //     }
        // });
    }

    function getSurveys(departmentId = null) {
        showLoadingScreen();
        const mainScreen = document.getElementById('mainScreen');
        const surveysScreen = document.getElementById('surveysScreen');
        
        mainScreen.classList.add('hidden');
        surveysScreen.classList.remove('hidden');
        surveysScreen.classList.remove('d-none');

        // Reset inactivity timer when showing surveys
        resetInactivityTimer();

        const surveys = [
            {
                id: 1,
                name: 'Müşteri Memnuniyet Anketi'
            },
            {
                id: 2,
                name: 'Danışman Değerlendirme Anketi'
            },
            {
                id: 3,
                name: 'Hizmet Kalitesi Anketi'
            }
        ];

        // Filter out completed surveys
        const availableSurveys = surveys.filter(survey => !completedSurveys.has(survey.id));

        // If all surveys are completed, return to main screen
        if (availableSurveys.length === 0) {
            hideLoadingScreen();
            returnToMainScreen();
            return;
        }

        // If there's only one survey available, automatically proceed to questions
        if (availableSurveys.length === 1) {
            hideLoadingScreen();
            surveySelected(availableSurveys[0].id);
            return;
        }

        // Show available surveys
        const buttonsContainer = surveysScreen.querySelector('.d-grid');
        buttonsContainer.innerHTML = '';

        availableSurveys.forEach(survey => {
            const button = document.createElement('button');
            button.className = 'btn btn-primary survey-btn';
            button.textContent = survey.name;
            button.setAttribute('data-survey-id', survey.id);
            button.addEventListener('click', function() {
                surveySelected(survey.id);
            });
            buttonsContainer.appendChild(button);
        });

        hideLoadingScreen();

        // API call commented out for now
        /*
        $.ajax({
            url: apiUrl + 'surveys',
            type: 'GET',
            data: { departmentId: departmentId },
            success: function(surveys) {
                // ... API success handling ...
            },
            error: function(xhr, status, error) {
                console.error('Error fetching surveys:', error);
                hideLoadingScreen();
                const buttonsContainer = surveysScreen.querySelector('.d-grid');
                buttonsContainer.innerHTML = '<div class="alert alert-danger">Anketler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.</div>';
            }
        });
        */
    }

    function fetchQuestions(surveyId) {
        showLoadingScreen();
        const questionsScreen = document.getElementById('questionsScreen');
        const stepper = document.getElementById('stepper');
        
        // Reset inactivity timer when showing questions
        resetInactivityTimer();

        // Get survey name from mock data
        const surveys = [
            {
                id: 1,
                name: 'Müşteri Memnuniyet Anketi'
            },
            {
                id: 2,
                name: 'Danışman Değerlendirme Anketi'
            },
            {
                id: 3,
                name: 'Hizmet Kalitesi Anketi'
            }
        ];
        const currentSurvey = surveys.find(s => s.id === surveyId);
        const surveyName = currentSurvey ? currentSurvey.name : 'Anket';

        // Sample questions data
        const questions = [
            {
                id: 1,
                title: "Müşteri Hizmetleri Değerlendirmesi",
                description: "Lütfen müşteri hizmetleri deneyiminizi değerlendirin",
                type: "single",
                answers: [
                    { id: 1, text: "Çok İyi" },
                    { id: 2, text: "İyi" },
                    { id: 3, text: "Orta" },
                    { id: 4, text: "Kötü" }
                ]
            },
            {
                id: 2,
                title: "Hangi Hizmetleri Kullandınız?",
                description: "Lütfen kullandığınız hizmetleri seçiniz",
                type: "multiple",
                answers: [
                    { id: 1, text: "Danışmanlık" },
                    { id: 2, text: "Eğitim" },
                    { id: 3, text: "Destek" },
                    { id: 4, text: "Diğer" }
                ]
            },
            {
                id: 3,
                title: "Önerileriniz",
                description: "Lütfen önerilerinizi yazınız",
                type: "text"
            }
        ];

        let currentQuestionIndex = 0;
        const answers = {};

        function renderQuestion() {
            const question = questions[currentQuestionIndex];
            stepper.innerHTML = `
                <div class="stepper-container">
                    <div class="stepper-header">
                        <div class="stepper-survey-name">${surveyName}</div>
                        <div class="stepper-question-info">
                            <h3 class="stepper-title">${question.title}</h3>
                            <span class="stepper-progress">${currentQuestionIndex + 1}/${questions.length}</span>
                        </div>
                    </div>
                    <div class="question-container">
                        <p class="question-description">${question.description}</p>
                        ${renderAnswerOptions(question)}
                    </div>
                    <div class="stepper-buttons">
                        <button class="stepper-btn prev" ${currentQuestionIndex === 0 ? 'disabled' : ''}>
                            Önceki
                        </button>
                        <button class="stepper-btn next" ${!isAnswerValid(question) ? 'disabled' : ''}>
                            ${currentQuestionIndex === questions.length - 1 ? 'Bitir' : 'Sonraki'}
                        </button>
                    </div>
                </div>
            `;

            // Add event listeners
            document.querySelector('.stepper-btn.prev').addEventListener('click', goToPreviousQuestion);
            document.querySelector('.stepper-btn.next').addEventListener('click', goToNextQuestion);
            addAnswerEventListeners(question);
        }

        function renderAnswerOptions(question) {
            if (question.type === 'text') {
                return `
                    <textarea class="text-answer" placeholder="Cevabınızı yazınız...">${answers[question.id] || ''}</textarea>
                `;
            }

            return `
                <div class="answer-options">
                    ${question.answers.map(answer => `
                        <div class="answer-option ${isAnswerSelected(question, answer.id) ? 'selected' : ''}" 
                             data-answer-id="${answer.id}">
                            ${answer.text}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function isAnswerSelected(question, answerId) {
            if (question.type === 'single') {
                return answers[question.id] === answerId;
            }
            if (question.type === 'multiple') {
                return (answers[question.id] || []).includes(answerId);
            }
            return false;
        }

        function isAnswerValid(question) {
            if (question.type === 'text') {
                return answers[question.id] && answers[question.id].trim().length > 0;
            }
            if (question.type === 'single') {
                return answers[question.id] !== undefined;
            }
            if (question.type === 'multiple') {
                return (answers[question.id] || []).length > 0;
            }
            return false;
        }

        function addAnswerEventListeners(question) {
            if (question.type === 'text') {
                const textarea = document.querySelector('.text-answer');
                textarea.addEventListener('input', (e) => {
                    answers[question.id] = e.target.value;
                    updateNextButton();
                });
                return;
            }

            const options = document.querySelectorAll('.answer-option');
            options.forEach(option => {
                option.addEventListener('click', () => {
                    const answerId = parseInt(option.dataset.answerId);
                    
                    if (question.type === 'single') {
                        answers[question.id] = answerId;
                        options.forEach(opt => opt.classList.remove('selected'));
                        option.classList.add('selected');
                    } else if (question.type === 'multiple') {
                        if (!answers[question.id]) {
                            answers[question.id] = [];
                        }
                        const index = answers[question.id].indexOf(answerId);
                        if (index === -1) {
                            answers[question.id].push(answerId);
                            option.classList.add('selected');
                        } else {
                            answers[question.id].splice(index, 1);
                            option.classList.remove('selected');
                        }
                    }
                    
                    updateNextButton();
                });
            });
        }

        function updateNextButton() {
            const nextButton = document.querySelector('.stepper-btn.next');
            const question = questions[currentQuestionIndex];
            nextButton.disabled = !isAnswerValid(question);
        }

        function goToPreviousQuestion() {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                renderQuestion();
            }
        }

        function goToNextQuestion() {
            if (currentQuestionIndex < questions.length - 1) {
                currentQuestionIndex++;
                renderQuestion();
            } else {
                // Submit answers
                console.log('Answers submitted:', answers);
                // Here you would typically send the answers to your backend
                
                // Mark the current survey as completed
                completedSurveys.add(currentSurveyId);
                console.log('Completed surveys:', Array.from(completedSurveys));
                
                questionsScreen.classList.add('hidden');
                const thanksScreen = document.getElementById('thanksScreen');
                thanksScreen.classList.remove('hidden');
                
                // Set timer to return to surveys screen after 10 seconds
                setTimeout(() => {
                    thanksScreen.classList.add('hidden');
                    getSurveys(selectedDepartment);
                }, 10000);
            }
        }

        questionsScreen.classList.remove('hidden');
        renderQuestion();
        hideLoadingScreen();

        // API call commented out for now
        /*
        $.ajax({
            url: apiUrl + 'questions',
            type: 'GET',
            data: { surveyId: surveyId },
            success: function(questions) {
                // ... API success handling ...
            },
            error: function(xhr, status, error) {
                console.error('Error fetching questions:', error);
                hideLoadingScreen();
                stepper.innerHTML = '<div class="alert alert-danger">Sorular yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.</div>';
            }
        });
        */
    }

    function surveySelected(surveyId) {
        currentSurveyId = surveyId;
        $('#surveysScreen').addClass('d-none');
        $('#questionsScreen').removeClass('hidden');
        fetchQuestions(surveyId);
        console.log('Selected survey ID:', surveyId);
    }

    document.getElementById('consultantSelect').addEventListener('change', function(e) {
        showLoadingScreen();
        selectedConsultant = e.target.value;
        if (selectedConsultant && selectedDepartment) {
            const infoScreen = document.getElementById('infoScreen');
            const mainScreen = document.getElementById('mainScreen');
            
            if (infoScreen && mainScreen) {
                infoScreen.classList.add('hidden');
                mainScreen.classList.remove('hidden');
                console.log('Consultant and department selected');
                hideLoadingScreen();

                setTimeout(() => {
                    getSurveys(selectedDepartment);
                }, 5000);
            }
        }
    });

    document.getElementById('departmentSelect').addEventListener('change', function(e) {
        selectedDepartment = e.target.value;
    });

    // Loading screen functions
    function showLoadingScreen() {
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            loadingScreen.classList.add('show');
        }
    }

    function hideLoadingScreen() {
        if (loadingScreen) {
            loadingScreen.classList.remove('show');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }
    }

    // Add event listeners for user activity
    document.addEventListener('mousemove', resetInactivityTimer);
    document.addEventListener('keydown', resetInactivityTimer);
    document.addEventListener('click', resetInactivityTimer);
    document.addEventListener('touchstart', resetInactivityTimer);
    document.addEventListener('scroll', resetInactivityTimer);

    // Initialize timer when the page loads
    $(document).ready(function() {
        resetInactivityTimer();
    });

    // Load initial data
    getConsultants();
    getDepartments();
});
