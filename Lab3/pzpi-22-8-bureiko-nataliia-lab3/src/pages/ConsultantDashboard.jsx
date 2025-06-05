import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BarChart, ShoppingBag } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { useLanguage } from '../context/LanguageContext';

const DashboardCard = ({ title, description, icon: Icon, to }) => (
  <Link
    to={to}
    className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200"
  >
    <div className="flex items-start space-x-4">
      <div className="p-3 bg-gray-100 rounded-full flex-shrink-0">
        <Icon className="w-6 h-6 text-gray-700" />
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <p className="mt-2 text-gray-600">{description}</p>
      </div>
    </div>
  </Link>
);

export const ConsultantDashboard = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('dashboard')}</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <DashboardCard
            title={t('clients')}
            description={t('clientInformationDesc')}
            icon={Users}
            to="/clients"
          />
          
          <DashboardCard
            title={t('statistics')}
            description={t('statisticsDesc')}
            icon={BarChart}
            to="/statistics"
          />

          <DashboardCard
            title={t('catalog')}
            description={t('catalogDesc')}
            icon={ShoppingBag}
            to="/catalog"
          />
        </div>
      </div>
    </div>
  );
};