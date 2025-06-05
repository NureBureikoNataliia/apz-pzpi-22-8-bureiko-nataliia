import React, { useState, useEffect } from 'react';
import { getStatistics, getSurveys, getCompletedSurveys } from '../services/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    Card,
    Title,
    Text,
    TabGroup,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Grid
} from "@tremor/react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const StatisticsPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        questions: [],
        mostCommonAgeRange: {},
        popularCategories: []
    });
    const [surveys, setSurveys] = useState([]);
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [completedSurveys, setCompletedSurveys] = useState({});

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

            // Load each data source separately to handle individual failures
            try {
                const statsData = await getStatistics();
                setStats(statsData);
            } catch (err) {
                console.error('Error loading statistics:', err);
                throw new Error('Failed to load statistics data');
            }

            try {
                const surveysData = await getSurveys();
                setSurveys(surveysData || []);
                // Set first survey as default if available
                if (surveysData && surveysData.length > 0) {
                    setSelectedSurvey(surveysData[0]);
                }
            } catch (err) {
                console.error('Error loading surveys:', err);
                setSurveys([]);
            }

            try {
                const completedData = await getCompletedSurveys();
                setCompletedSurveys(completedData || {});
            } catch (err) {
                console.error('Error loading completed surveys:', err);
                setCompletedSurveys({});
            }

        } catch (err) {
            setError(err.message || 'Error loading statistics');
        } finally {
            setLoading(false);
        }
    };

    // Add retry button handler
    const handleRetry = () => {
        loadData();
    };

    // Get questions for selected survey
    const getQuestionsForSurvey = () => {
        if (!selectedSurvey) return [];
        return stats.questions.filter(q =>
            selectedSurvey.questions.includes(q._id)
        );
    };

    // Transform answers data for the selected question
    const getAnswersChartData = () => {
        if (!selectedQuestion) return [];
        return selectedQuestion.answers.map(answer => ({
            name: answer.text,
            value: answer.count || 0
        }));
    };

    // Get age distribution data
    const getAgeDistributionData = () => {
        const ageRanges = {
            male: stats.mostCommonAgeRange.male || {},
            female: stats.mostCommonAgeRange.female || {}
        };

        // Define age range labels
        const ageRangeLabels = {
            0: 'Under 12',
            1: '12-18',
            2: '18-30',
            3: '30-40',
            4: '40-65',
            5: '65+'
        };

        // Get all unique age ranges
        const allRanges = [...new Set([
            ...Object.keys(ageRanges.male),
            ...Object.keys(ageRanges.female)
        ])];

        const sortedRanges = allRanges.sort((a, b) => {
            const aNum = parseInt(a);
            const bNum = parseInt(b);

            if (!isNaN(aNum) && !isNaN(bNum)) {
                return aNum - bNum;
            }

            if (typeof a === 'string' && typeof b === 'string' && a.includes('-') && b.includes('-')) {
                const [aMin] = a.split('-').map(Number);
                const [bMin] = b.split('-').map(Number);
                return aMin - bMin;
            }

            return 0;
        });

        return sortedRanges.map(range => {
            const label = ageRangeLabels[range] || `Range ${range}`;


            const maleCount = Number(ageRanges.male[range]) || 0;
            const femaleCount = Number(ageRanges.female[range]) || 0;

            return {
                range: label,
                male: maleCount,
                female: femaleCount,
            };
        });
    };
    // Get popular categories data
    const getCategoriesData = () => {
        return stats.popularCategories.map((cat, index) => ({
            name: cat.name,
            value: 1,
            color: COLORS[index % COLORS.length]
        }));
    };

    // Custom tooltip for answers chart
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 shadow-lg rounded-lg border">
                    <p className="font-medium">{payload[0].payload.name}</p>
                    <p className="text-gray-600">
                        Responses: <span className="font-medium">{payload[0].value}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading statistics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-lg mb-4">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <Title className="text-3xl font-bold text-gray-900">Survey Statistics</Title>
                <Text className="mt-2 text-gray-600">Comprehensive overview of survey responses and demographics</Text>
            </div>

            <TabGroup>
                <TabList className="mb-8">
                    <Tab>Questions & Answers</Tab>
                    <Tab>Demographics</Tab>
                    <Tab>Categories</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        {/* Questions and Answers Chart */}
                        <Card className="mt-4">
                            <Title>Survey Responses Analysis</Title>
                            <Text className="mt-2">Select a survey and question to view response distribution</Text>

                            {/* Survey selector */}
                            <div className="mt-4">
                                <Text className="mb-2 font-medium">Select Survey:</Text>
                                <select
                                    className="w-full p-2 border rounded-lg"
                                    value={selectedSurvey?._id || ''}
                                    onChange={(e) => {
                                        const survey = surveys.find(s => s._id === e.target.value);
                                        setSelectedSurvey(survey);
                                        setSelectedQuestion(null);
                                    }}
                                >
                                    <option value="">Select a survey...</option>
                                    {surveys.map(survey => (
                                        <option key={survey._id} value={survey._id}>
                                            {survey.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Question selector */}
                            {selectedSurvey && (
                                <div className="mt-4">
                                    <Text className="mb-2 font-medium">Select Question:</Text>
                                    <select
                                        className="w-full p-2 border rounded-lg"
                                        value={selectedQuestion?._id || ''}
                                        onChange={(e) => {
                                            const question = getQuestionsForSurvey().find(q => q._id === e.target.value);
                                            setSelectedQuestion(question);
                                        }}
                                    >
                                        <option value="">Select a question...</option>
                                        {getQuestionsForSurvey().map(question => (
                                            <option key={question._id} value={question._id}>
                                                {question.question}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Selected question details */}
                            {selectedQuestion && (
                                <div className="mt-6">
                                    <Text className="font-medium text-lg">{selectedQuestion.question}</Text>
                                    <div className="h-96 mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={getAnswersChartData()}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="name"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={60}
                                                    interval={0}
                                                />
                                                <YAxis
                                                    label={{ value: 'Number of Responses', angle: -90, position: 'insideLeft' }}
                                                    allowDecimals={false}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar
                                                    dataKey="value"
                                                    fill="#8884d8"
                                                    name="Responses"
                                                >
                                                    {getAnswersChartData().map((entry, index) => (
                                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Answer statistics */}
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {getAnswersChartData().map((answer, index) => (
                                            <div
                                                key={index}
                                                className="p-4 rounded-lg"
                                                style={{ backgroundColor: `${COLORS[index % COLORS.length]}15` }}
                                            >
                                                <Text className="font-medium">{answer.name}</Text>
                                                <Text className="text-2xl font-bold mt-2">{answer.value}</Text>
                                                <Text className="text-sm text-gray-600">responses</Text>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>
                    </TabPanel>

                    <TabPanel>
                        {/* Age Distribution */}
                        <Card className="mt-4">
                            <Title>Age Distribution Analysis</Title>
                            <Text className="mt-2">Distribution of respondents across different age groups by gender</Text>

                            <div className="h-96 mt-8">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={getAgeDistributionData()}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="range" />
                                        <YAxis
                                            label={{ value: 'Number of People', angle: -90, position: 'insideLeft' }}
                                            allowDecimals={false}
                                        />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="male" name="Male" fill="#3b82f6" stackId="gender" />
                                        <Bar dataKey="female" name="Female" fill="#ec4899" stackId="gender" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Age distribution statistics */}
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                                {getAgeDistributionData().map((data, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                        <Text className="font-medium">{data.range}</Text>
                                        <div className="mt-2 space-y-1">
                                            <div className="flex justify-between items-center">
                                                <Text className="text-blue-600">Male:</Text>
                                                <Text className="font-medium">{data.male}</Text>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <Text className="text-pink-600">Female:</Text>
                                                <Text className="font-medium">{data.female}</Text>
                                            </div>
                                            <div className="flex justify-between items-center pt-1 border-t">
                                                <Text>Total:</Text>
                                                <Text className="font-bold">{data.male + data.female}</Text>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Overall Statistics */}
                            <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                                <Text className="font-medium text-lg mb-4">Overall Statistics</Text>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {(() => {
                                        const data = getAgeDistributionData();
                                        const totalMale = data.reduce((sum, item) => sum + item.male, 0);
                                        const totalFemale = data.reduce((sum, item) => sum + item.female, 0);
                                        const total = totalMale + totalFemale;

                                        return (
                                            <>
                                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                                    <Text className="text-blue-600">Total Male:</Text>
                                                    <Text className="font-bold">{totalMale}</Text>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                                                    <Text className="text-pink-600">Total Female:</Text>
                                                    <Text className="font-bold">{totalFemale}</Text>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                                                    <Text>Total Respondents:</Text>
                                                    <Text className="font-bold">{total}</Text>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </Card>
                    </TabPanel>

                    <TabPanel>
                        {/* Popular Categories */}
                        <Card className="mt-4">
                            <Title>Most Popular Categories</Title>
                            <Text className="mt-2">Distribution of popular product categories based on survey responses</Text>
                            <div className="h-96 mt-8">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={getCategoriesData()}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                            outerRadius={150}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {getCategoriesData().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {getCategoriesData().map((category, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center p-3 rounded-lg"
                                        style={{ backgroundColor: `${category.color}15` }}
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full mr-3"
                                            style={{ backgroundColor: category.color }}
                                        />
                                        <Text>{category.name}</Text>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    );
};

export default StatisticsPage; 