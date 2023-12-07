document.addEventListener('DOMContentLoaded', function(){
    const isNumeric = (input) => !isNaN(parseFloat(input)) && isFinite(input);

    const predictButton = document.getElementById('predict-button');
    var calculatorModal = new bootstrap.Modal(document.getElementById('calculatorModal')); 
    var resultsModal = new bootstrap.Modal(document.getElementById('resultsModal')); 

    let model;
  
    const predictionList = document.getElementById('prediction-list');
    predictionList.innerHTML = '';

    tf.loadLayersModel('ML/softmax(95)/LogisticReg.json')
    .then(loadedModel =>{
        model = loadedModel;
    }).catch(error =>{
        console.error('Error loading the model:', error);
    });

    function mapToBinary(value){
        return value.toLowerCase() === 'no' ? 0: value.toLowerCase() === 'yes' ? 1 : NaN;
    }

    function getCKDResult(predictedClass){
        switch(predictedClass) {
            case 0:
                return "There are no marks for Chronic Kidney Disease";
            case 1:
                return "Please Consult the Doctor immediately. It was too risky without consultation.";
            case 2:
                return "Please Consult the Doctor immediately. It was too risky without consultation.";
            case 3:
                return "Please Consult the Doctor immediately. It was too risky without consultation.";
            case 4:
                return "Please Consult the Doctor immediately. It was too risky without consultation.";
            default:
                return "";
        }
    }

    function displayImage(predictedClass){
        const imageContainer = document.getElementById('image-container');
        imageContainer.innerHTML = ''; //Clear previous image

        if(predictedClass > 0){
            const image = document.createElement('img');
            image.alt = 'Stage ${predictedClass} Image';
            image.classList.add('img-fluid');

            switch(predictedClass){
                case 1:
                    image.src = 'img/PNG_PICS/stage2-final.png';
                    break;
                case 2:
                    image.src = 'img/PNG_PICS/stage3-final.png';
                    break;
                case 3:
                    image.src = 'img/PNG_PICS/stage4-final.png';
                    break;
                case 4:
                    image.src = 'img/PNG_PICS/stage5-final.png';
                    break;
                default:
                    break;
            }
            imageContainer.appendChild(image);
        }
    }

    predictButton.addEventListener('click', function(event){
        event.preventDefault();

        const form = document.getElementById('risk-calculator-form');
        const inputs = form.querySelectorAll('input, select');

        let isValid = true;

        inputs.forEach((input) => {
            const inputValue = input.value.trim();

            if (inputValue === '') {
                isValid = false;
                input.classList.add('is-invalid');
            } else if (!isNumeric(inputValue) && !['gender-form', 'hypertension-form', 'anemia-form', 'diabetesmellitus-form'].includes(input.id)) {
                isValid = false;
                input.classList.add('is-invalid');
                input.setCustomValidity('Please enter a valid number.');
            } else if (['albumin-form', 'bloodurea-form', 'serumcreatinine-form', 'sodium-form', 'potassium-form', 'calcium-form'].includes(input.id)) {
                const numericValue = parseFloat(inputValue);
    
                if (numericValue <= 0 || isNaN(numericValue)) {
                    isValid = false;
                    input.classList.add('is-invalid');
                    input.setCustomValidity(`${input.id.charAt(0).toUpperCase() + input.id.slice(1)} must be a positive number.`);
                } else {
                    input.classList.remove('is-invalid');
                    input.setCustomValidity('');
                }
            } else if (input.id === 'age-form') {
                const ageValue = parseFloat(inputValue, 10);
    
                if (/^0\d*$/.test(inputValue) || isNaN(ageValue) || ageValue <= 0 || ageValue >= 121 || ageValue % 1 !== 0) {
                    isValid = false;
                    input.classList.add('is-invalid');
                    input.setCustomValidity('Age must be between 1 and 120 without leading zeros.');
                } else {
                    input.classList.remove('is-invalid');
                    input.setCustomValidity('');
                }
            } else {
                input.classList.remove('is-invalid');
                input.setCustomValidity('');
            }
        });

        if (isValid) {
            const gender = document.getElementById('gender-form').value.toLowerCase() === 'male' ? 0:1;
            const age = parseFloat(document.getElementById('age-form').value);
            const albumin = parseFloat(document.getElementById('albumin-form').value);
            const bloodUrea = parseFloat(document.getElementById('bloodurea-form').value);
            const serumCreatinine = parseFloat(document.getElementById('serumcreatinine-form').value);
            const sodium = parseFloat(document.getElementById('sodium-form').value);
            const potassium = parseFloat(document.getElementById('potassium-form').value);
            const calcium = parseFloat(document.getElementById('calcium-form').value);
            const hypertension = mapToBinary(document.getElementById('hypertension-form').value);
            const diabetesMellitus = mapToBinary(document.getElementById('diabetesmellitus-form').value);
            const anemia = mapToBinary(document.getElementById('anemia-form').value);

            if(model) {
                const inputData = tf.tensor([[gender, age, albumin, bloodUrea, serumCreatinine, sodium, potassium, calcium, hypertension, diabetesMellitus, anemia]]);
                const prediction = model.predict(inputData);

                // Clear previous inputs
                while(predictionList.firstChild){
                    predictionList.removeChild(predictionList.firstChild);
                }

                const predictionResult = prediction.dataSync();
                console.log("Prediction Result", predictionResult);

                const predictedClassIndex = predictionResult.indexOf(Math.max(...predictionResult));

                const predictedClass = predictedClassIndex;
                console.log("Predicted Class:", predictedClass);

                const resultText = getCKDResult(predictedClass);

                const predictionItem = document.createElement('p');
                predictionItem.textContent = `${resultText}`;
                predictionList.appendChild(predictionItem);

                
                displayImage(predictedClass);

                calculatorModal.hide();
                resultsModal.show(); 
            }
            else{
                console.error('Model has not been loaded yet.');
            }
        } else {
            form.classList.add('was-validated');
        }
    });

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });

    calculatorModal._element.addEventListener('hidden.bs.modal', function () {
        const form = document.getElementById('risk-calculator-form');
        form.reset();
        form.classList.remove('was-validated');

        // Clear validations
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach((input) => {
            input.classList.remove('is-invalid');
        });
    });

    // Reset validation 
    resultsModal._element.addEventListener('show.bs.modal', function () {
        const form = document.getElementById('risk-calculator-form');
        form.reset();
        form.classList.remove('was-validated');
    });

    const inputs = document.querySelectorAll('#risk-calculator-form input, #risk-calculator-form select');
    inputs.forEach((input) => {
        input.addEventListener('input', function () {
            this.classList.remove('is-invalid');
        });
    });

    closeModalAndResetVideo('kidneysModal', 'educVideo');
    closeModalAndResetVideo('resultsModal', 'resultVideo');

    function closeModalAndResetVideo(modalId, videoId) {
        const modalCloseButton = document.querySelector(`#${modalId} [data-bs-dismiss="modal"]`);
        modalCloseButton.addEventListener('click', function () {
            const video = document.getElementById(videoId);
            if (video) {
                video.pause();
                video.currentTime = 0; // Reset the video to the beginning
            }
        });
    }
});
