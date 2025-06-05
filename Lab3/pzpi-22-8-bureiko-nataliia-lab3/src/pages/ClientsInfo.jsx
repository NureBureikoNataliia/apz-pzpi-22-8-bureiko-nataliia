import React, { useState, useEffect } from 'react';
import { getClients, getCategories, getQuestions, getAnswers, getSurveys } from '../services/api';
import { Eye, Users, UserCheck, X, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ClientsPage = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [categories, setCategories] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [showAnswersModal, setShowAnswersModal] = useState(false);

    // Filters state
    const [filters, setFilters] = useState({
        survey: '',
        gender: '',
        ageGroup: ''
    });

    // Load all data
    useEffect(() => {
        // Check for authentication
        const adminToken = sessionStorage.getItem("Admin");
        const consultantToken = sessionStorage.getItem("Consultant");
        
        if (!adminToken && !consultantToken) {
            navigate('/');
            return;
        }

        // Set the authorization header
        const token = adminToken || consultantToken;
        axios.defaults.headers.common["authorization"] = `Bearer ${token}`;
        
        loadData();
    }, [navigate]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            try {
                const [clientsData, categoriesData, questionsData, answersData, surveysData] = await Promise.all([
                    getClients(),
                    getCategories(),
                    getQuestions(),
                    getAnswers(),
                    getSurveys()
                ]);
                
                setClients(clientsData || []);
                setCategories(categoriesData || []);
                setQuestions(questionsData || []);
                setAnswers(answersData || []);
                setSurveys(surveysData || []);
            } catch (err) {
                console.error('Error loading data:', err);
                if (err.response?.status === 401) {
                    throw new Error('Authentication required. Please log in again.');
                } else if (err.response?.status === 403) {
                    throw new Error('You do not have permission to access this data.');
                }
                throw new Error('Failed to load client data. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'Error loading client data');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleShowAnswers = (client) => {
        console.log('Selected client for answers:', client);
        setSelectedClient(client);
        setShowAnswersModal(true);
    };

    const getGenderDisplay = (gender) => {
        switch (gender) {
            case 'male': return 'Male';
            case 'female': return 'Female';
            default: return 'Not specified';
        }
    };

    const getAgeGroup = (age) => {
        if (age < 18) return 'Under 18';
        if (age < 25) return '18-24';
        if (age < 35) return '25-34';
        if (age < 45) return '35-44';
        if (age < 55) return '45-54';
        return '55+';
    };

    // Get all available age groups
    const getAgeGroups = () => [
        'Under 18',
        '18-24',
        '25-34',
        '35-44',
        '45-54',
        '55+'
    ];

    const getCategoryNames = (categoryIds) => {
        if (!categoryIds || categoryIds.length === 0) return 'No recommendations';
        
        const categoryNames = categoryIds.map(id => {
            const category = categories.find(cat => cat._id === id);
            return category ? category.name : 'Unknown';
        });
        
        return categoryNames.join(', ');
    };

    // Get question text by ID
    const getQuestionText = (questionId) => {
        const question = questions.find(q => q._id === questionId);
        return question ? question.text || question.question || question.title : `Question ID: ${questionId}`;
    };

    // Get answer text by ID
    const getAnswerText = (answerId) => {
        const answer = answers.find(a => a._id === answerId);
        return answer ? answer.text || answer.answer || answer.title : `Answer ID: ${answerId}`;
    };

    // Get survey name by ID
    const getSurveyName = (questionId) => {
        const question = questions.find(q => q._id === questionId);
        if (question && question.surveys && question.surveys.length > 0) {
            const survey = surveys.find(s => s._id === question.surveys[0]);
            return survey ? survey.name : 'Unknown Survey';
        }
        return 'Unknown Survey';
    };

    // Helper function to safely get survey answers with text
    const getSurveyAnswers = (client) => {
        const possibleAnswers = [
            client.survey_answers,
            client.surveyAnswers,
            client.answers,
            client.survey,
            client.responses
        ];
        
        for (const answers of possibleAnswers) {
            if (answers && Array.isArray(answers) && answers.length > 0) {
                return answers.map((item, index) => ({
                    surveyName: getSurveyName(item.question_id),
                    question: getQuestionText(item.question_id),
                    answer: getAnswerText(item.answer_id),
                    index: index + 1
                }));
            }
        }
        
        return [];
    };

    // Get unique survey names from all clients
    const getUniqueSurveys = () => {
        const surveyNames = new Set();
        clients.forEach(client => {
            const answers = getSurveyAnswers(client);
            answers.forEach(answer => surveyNames.add(answer.surveyName));
        });
        return Array.from(surveyNames);
    };

    // Filter clients based on selected filters
    const getFilteredClients = () => {
        return clients.filter(client => {
            const surveyAnswers = getSurveyAnswers(client);
            const clientSurveys = [...new Set(surveyAnswers.map(a => a.surveyName))];
            const clientAgeGroup = getAgeGroup(client.age);

            const surveyMatch = !filters.survey || clientSurveys.includes(filters.survey);
            const genderMatch = !filters.gender || client.gender === filters.gender;
            const ageGroupMatch = !filters.ageGroup || clientAgeGroup === filters.ageGroup;

            return surveyMatch && genderMatch && ageGroupMatch;
        });
    };

    // Reset all filters
    const handleResetFilters = () => {
        setFilters({
            survey: '',
            gender: '',
            ageGroup: ''
        });
    };

    const AnswersModal = ({ client, onClose }) => {
        if (!client) return null;

        const surveyAnswers = getSurveyAnswers(client);
        
        // Group answers by survey
        const answersBySurvey = surveyAnswers.reduce((acc, answer) => {
            if (!acc[answer.surveyName]) {
                acc[answer.surveyName] = [];
            }
            acc[answer.surveyName].push(answer);
            return acc;
        }, {});

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Survey Answers - Client {clients.indexOf(client) + 1}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                        {Object.entries(answersBySurvey).length > 0 ? (
                            <div className="space-y-6">
                                {Object.entries(answersBySurvey).map(([surveyName, answers], surveyIndex) => (
                                    <div key={surveyIndex} className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">{surveyName}</h4>
                                        <div className="space-y-4">
                                            {answers.map((item, index) => (
                                                <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                                                    <div className="mb-2">
                                                        <p className="text-gray-900 font-medium">
                                                            {item.question}
                                                        </p>
                                                        <p className="text-gray-900 mt-1">
                                                            {item.answer}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No survey answers available for this client.</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end p-6 border-t border-gray-200">
                        <Button
                            onClick={onClose}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading client data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-lg">{error}</p>
                    <Button 
                        onClick={loadData}
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    const filteredClients = getFilteredClients();

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-gray-900">Client Information</h1>
                </div>
                
                {/* Filters */}
<div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
    <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Survey</label>
            <select
                value={filters.survey}
                onChange={(e) => setFilters({ ...filters, survey: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">All Surveys</option>
                {getUniqueSurveys().map((survey, index) => (
                    <option key={index} value={survey}>{survey}</option>
                ))}
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
                value={filters.gender}
                onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
            <select
                value={filters.ageGroup}
                onChange={(e) => setFilters({ ...filters, ageGroup: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">All Age Groups</option>
                {getAgeGroups().map((group, index) => (
                    <option key={index} value={group}>{group}</option>
                ))}
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
            <Button
                onClick={handleResetFilters}
                className="w-full"
            >
                Reset Filters
            </Button>
        </div>
    </div>
</div>


                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                        <div className="flex items-center space-x-3">
                            <UserCheck className="w-6 h-6 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">Total Clients</p>
                                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                        <div className="flex items-center space-x-3">
                            <Eye className="w-6 h-6 text-purple-600" />
                            <div>
                                <p className="text-sm text-gray-600">Filtered Clients</p>
                                <p className="text-2xl font-bold text-gray-900">{filteredClients.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clients Table */}
            {filteredClients.length === 0 ? (
                <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Clients Found</h3>
                    <p className="text-gray-600">No clients match the selected filters.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-fixed divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="w-16 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Client
                                    </th>
                                    <th className="w-24 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Gender
                                    </th>
                                    <th className="w-20 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Age
                                    </th>
                                    <th className="w-24 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Age Group
                                    </th>
                                    <th className="w-40 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Completed Survey
                                    </th>
                                    <th className="w-32 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Survey Answers
                                    </th>
                                    <th className="w-48 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Recommended Categories
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredClients.map((client, index) => {
                                    const surveyAnswers = getSurveyAnswers(client);
                                    const completedSurveys = [...new Set(surveyAnswers.map(a => a.surveyName))];
                                    
                                    return (
                                        <tr key={client._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    client.gender === 'male' 
                                                        ? 'bg-blue-100 text-blue-800' 
                                                        : 'bg-pink-100 text-pink-800'
                                                }`}>
                                                    {getGenderDisplay(client.gender)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-gray-900">
                                                {client.age || 'Not specified'}
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-gray-500">
                                                {client.age ? getAgeGroup(client.age) : 'Not determined'}
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-gray-900">
                                                {completedSurveys.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {completedSurveys.map((surveyName, idx) => (
                                                            <div key={idx} className="text-sm text-gray-900">
                                                                {surveyName}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">No surveys completed</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm">
                                                {surveyAnswers.length > 0 ? (
                                                    <button
                                                        onClick={() => handleShowAnswers(client)}
                                                        className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 hover:bg-green-200 transition-colors cursor-pointer"
                                                    >
                                                        {surveyAnswers.length} answers
                                                    </button>
                                                ) : (
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                                        No answers
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-gray-900">
                                                <div className="truncate" title={getCategoryNames(client.recommended_categories)}>
                                                    {getCategoryNames(client.recommended_categories)}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Answers Modal */}
            {showAnswersModal && (
                <AnswersModal 
                    client={selectedClient} 
                    onClose={() => {
                        setShowAnswersModal(false);
                        setSelectedClient(null);
                    }} 
                />
            )}
        </div>
    );
};

export default ClientsPage;