import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import axios from 'axios';
import { useLanguage } from "../context/LanguageContext";

export function Surveys() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/surveys`);
      setSurveys(response.data);
    } catch (error) {
      console.error('Error loading surveys:', error);
    }
  };

  const deleteSurvey = async (id) => {
    if (window.confirm(t('confirmDelete') + " survey?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/surveys/${id}`);
        loadSurveys();
      } catch (error) {
        console.error('Error deleting survey:', error);
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('surveys')}</h1>
        <Button onClick={() => navigate('/surveys/create')}>
          {t('createSurvey')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.map((survey) => (
          <Card key={survey._id} className="p-6">
            <h2 className="text-xl font-semibold mb-2">{survey.title}</h2>
            <p className="text-gray-600 mb-4">{survey.description}</p>
            <p className="text-sm text-gray-500 mb-4">
              {survey.questions.length} {t('questionCount')}
            </p>
            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => navigate(`/surveys/${survey._id}`)}
              >
                {t('viewDetails')}
              </Button>
              <Button 
                variant="destructive"
                onClick={() => deleteSurvey(survey._id)}
              >
                {t('deleteSurvey')}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {surveys.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          {t('noSurveys')}
        </div>
      )}
    </div>
  );
} 