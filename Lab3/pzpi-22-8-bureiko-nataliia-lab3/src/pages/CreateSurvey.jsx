import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import axios from 'axios';

export function CreateSurvey() {
  const navigate = useNavigate();
  const [survey, setSurvey] = useState({
    title: '',
    description: '',
    questions: [{ text: '', type: 'text', options: [] }]
  });

  const addQuestion = () => {
    setSurvey({
      ...survey,
      questions: [...survey.questions, { text: '', type: 'text', options: [] }]
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = survey.questions.filter((_, i) => i !== index);
    setSurvey({ ...survey, questions: newQuestions });
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...survey.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setSurvey({ ...survey, questions: newQuestions });
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...survey.questions];
    newQuestions[questionIndex].options.push('');
    setSurvey({ ...survey, questions: newQuestions });
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const newQuestions = [...survey.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setSurvey({ ...survey, questions: newQuestions });
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...survey.questions];
    newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
    setSurvey({ ...survey, questions: newQuestions });
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/surveys`, survey);
      navigate('/surveys');
    } catch (error) {
      console.error('Error creating survey:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Survey</h1>

        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="block mb-2">Survey Title</Label>
              <Input
                id="title"
                value={survey.title}
                onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="description" className="block mb-2">Description</Label>
              <Textarea
                id="description"
                value={survey.description}
                onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
        </Card>

        {survey.questions.map((question, questionIndex) => (
          <Card key={questionIndex} className="p-6 mb-4">
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <Label className="block mb-2 text-center">Question {questionIndex + 1}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={question.text}
                      onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                      placeholder="Enter your question"
                      className="w-full"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeQuestion(questionIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label className="block mb-2">Question Type</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={question.type}
                  onChange={(e) => updateQuestion(questionIndex, 'type', e.target.value)}
                >
                  <option value="text">Text</option>
                  <option value="radio">Single Choice</option>
                  <option value="checkbox">Multiple Choice</option>
                </select>
              </div>

              {(question.type === 'radio' || question.type === 'checkbox') && (
                <div className="space-y-3">
                  <Label className="block">Options</Label>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                        placeholder={`Option ${optionIndex + 1}`}
                        className="flex-1"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeOption(questionIndex, optionIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addOption(questionIndex)}
                    className="mt-2"
                  >
                    Add Option
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}

        <div className="flex justify-between mt-6">
          <Button onClick={addQuestion}>
            Add Question
          </Button>
          <Button onClick={handleSubmit}>
            Create Survey
          </Button>
        </div>
      </div>
    </div>
  );
} 