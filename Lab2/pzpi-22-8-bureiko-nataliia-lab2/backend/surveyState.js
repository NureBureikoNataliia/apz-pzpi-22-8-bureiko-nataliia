let surveyCompleted = false;
let timeoutId = null;

const setSurveyCompleted = (value) => {
    surveyCompleted = value;
    
    if (value === true) {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            surveyCompleted = false;
            timeoutId = null;
        }, 10000);
    }
};

const getSurveyCompleted = () => {
    return surveyCompleted;
};

module.exports = {
    setSurveyCompleted,
    getSurveyCompleted
};