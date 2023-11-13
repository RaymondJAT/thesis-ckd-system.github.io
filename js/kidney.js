document.addEventListener('DOMContentLoaded', function(){
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
            if (input.value.trim() === '') {
                isValid = false;
                input.classList.add('is-invalid');
            } else {
                input.classList.remove ('is-invalid');
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
});
