import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import axios from "axios";

const EditSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    const loadSurvey = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get survey data
        const surveyResponse = await axios.get(`http://localhost:3000/surveys/${id}`);
        const surveyData = surveyResponse.data;

        if (!surveyData) {
          throw new Error('Survey not found');
        }

        // Set form values
        form.reset({
          name: surveyData.name || '',
          description: surveyData.description || '',
        });

        // Get questions data if they exist
        if (surveyData.questions && Array.isArray(surveyData.questions) && surveyData.questions.length > 0) {
          const questionsPromises = surveyData.questions.map(questionId =>
            axios.get(`http://localhost:3000/questions/${questionId}`)
          );
          const questionsResponses = await Promise.all(questionsPromises);
          const questionsData = questionsResponses.map(response => {
            const questionData = response.data;
            return {
              _id: questionData._id,
              text: questionData.text || '',
              answers: Array.isArray(questionData.answers) 
                ? questionData.answers.map(answer => answer.text || answer.answer || '')
                : ['', '']
            };
          });
          setQuestions(questionsData);
        } else {
          // If no questions, initialize with an empty question
          setQuestions([{ text: '', answers: ['', ''] }]);
        }
      } catch (err) {
        console.error('Error loading survey:', err);
        setError(err.message || 'Failed to load survey');
      } finally {
        setLoading(false);
      }
    };

    const adminToken = sessionStorage.getItem("Admin");
    const consultantToken = sessionStorage.getItem("Consultant");
    
    if (!adminToken && !consultantToken) {
      navigate('/');
      return;
    }

    const token = adminToken || consultantToken;
    axios.defaults.headers.common["authorization"] = `Bearer ${token}`;

    loadSurvey();
  }, [id, navigate, form]);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', answers: ['', ''] }]);
  };

  const removeQuestion = (questionIndex) => {
    const newQuestions = questions.filter((_, index) => index !== questionIndex);
    setQuestions(newQuestions);
  };

  const addAnswer = (questionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].answers.push('');
    setQuestions(newQuestions);
  };

  const removeAnswer = (questionIndex, answerIndex) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].answers.length > 2) {
      newQuestions[questionIndex].answers = newQuestions[questionIndex].answers.filter(
        (_, index) => index !== answerIndex
      );
      setQuestions(newQuestions);
    }
  };

  const updateQuestionText = (questionIndex, text) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].text = text;
    setQuestions(newQuestions);
  };

  const updateAnswer = (questionIndex, answerIndex, text) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].answers[answerIndex] = text;
    setQuestions(newQuestions);
  };

  const onSubmit = async (data) => {
    try {
      // Validate questions
      const validQuestions = questions.filter(q => q.text.trim() !== '' && 
        q.answers.filter(a => a.trim() !== '').length >= 2);

      if (validQuestions.length === 0) {
        setError('Please add at least one question with two answers');
        return;
      }

      // Update survey data
      await axios.put(`http://localhost:3000/surveys/${id}`, {
        name: data.name,
        description: data.description,
        questions_amount: validQuestions.length,
        change_date: new Date().toLocaleString(),
        actuality: true
      });

      // Update or create questions
      const questionPromises = validQuestions.map(async (question) => {
        const questionData = {
          text: question.text,
          answers: question.answers
            .filter(text => text.trim() !== '')
            .map(text => ({ 
              text: text.trim(),
              answer: text.trim() // Adding answer field for compatibility
            }))
        };

        if (question._id) {
          // Update existing question
          return axios.put(`http://localhost:3000/questions/${question._id}`, questionData);
        } else {
          // Create new question
          const response = await axios.post('http://localhost:3000/questions', questionData);
          return response;
        }
      });

      await Promise.all(questionPromises);
      navigate('/surveys');
    } catch (err) {
      console.error('Error updating survey:', err);
      setError(err.message || 'Failed to update survey');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Card>
          <CardContent className="p-6 text-center">
            Loading...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Card>
          <CardContent className="p-6 text-center text-red-600">
            {error}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-8">Edit Survey</h1>
      <Card>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Survey Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter survey name" {...field} className="text-sm" />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter survey description"
                          {...field}
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Questions</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addQuestion}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </div>

                {questions.map((question, questionIndex) => (
                  <Card key={questionIndex}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <FormItem className="flex-1">
                            <FormLabel className="text-sm font-semibold">Question {questionIndex + 1}</FormLabel>
                            <div className="flex items-center gap-2">
                              <FormControl className="flex-1">
                                <Input
                                  value={question.text}
                                  onChange={(e) => updateQuestionText(questionIndex, e.target.value)}
                                  placeholder="Enter your question"
                                  className="text-sm"
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => removeQuestion(questionIndex)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormItem>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-sm font-semibold">Answers (minimum 2)</FormLabel>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addAnswer(questionIndex)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Answer
                            </Button>
                          </div>
                          {question.answers.map((answer, answerIndex) => (
                            <div key={answerIndex} className="flex items-center gap-2">
                              <Input
                                value={answer}
                                onChange={(e) => updateAnswer(questionIndex, answerIndex, e.target.value)}
                                placeholder={`Answer ${answerIndex + 1}`}
                                className="text-sm"
                              />
                              {question.answers.length > 2 && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => removeAnswer(questionIndex, answerIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/surveys')}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditSurvey; 