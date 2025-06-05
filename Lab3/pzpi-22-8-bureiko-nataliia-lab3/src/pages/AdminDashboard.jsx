import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEmployees } from '../services/api';
import { 
  Users, 
  BarChart, 
  ShoppingBag, 
  FileText, 
  ClipboardList, 
  PackagePlus, 
  UserCog 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from 'axios';
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

export function AdminDashboard() {
  const navigate = useNavigate();
  const [consultants, setConsultants] = useState([]);
  const [newConsultant, setNewConsultant] = useState({
    firstName: '',
    surname: '',
    email: '',
    password: '',
    admin: false
  });
  const { t } = useLanguage();

  useEffect(() => {
    loadConsultants();
  }, []);

  const loadConsultants = async () => {
    try {
      const data = await getEmployees();
      setConsultants(data.filter(emp => !emp.admin));
    } catch (error) {
      console.error('Error loading consultants:', error);
    }
  };

  const handleCreateConsultant = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/employees`, newConsultant);
      loadConsultants();
      setNewConsultant({
        firstName: '',
        surname: '',
        email: '',
        password: '',
        admin: false
      });
    } catch (error) {
      console.error('Error creating consultant:', error);
    }
  };

  const handleDeleteConsultant = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/employees/${id}`);
      loadConsultants();
    } catch (error) {
      console.error('Error deleting consultant:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('dashboard')}</h1>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Product Management */}
          <DashboardCard
            title={t('catalog')}
            description={t('productManagementDesc')}
            icon={ShoppingBag}
            to="/catalog"
          />
          
          {/* Survey Management */}
          <DashboardCard
            title={t('surveys')}
            description={t('surveyManagementDesc')}
            icon={FileText}
            to="/surveys"
          />

          {/* Client Information */}
          <DashboardCard
            title={t('clients')}
            description={t('clientInformationDesc')}
            icon={Users}
            to="/clients"
          />
          
          {/* Statistics */}
          <DashboardCard
            title={t('statistics')}
            description={t('statisticsDesc')}
            icon={BarChart}
            to="/statistics"
          />

          {/* Create Product */}
          <DashboardCard
            title={t('createProduct')}
            description={t('createProductDesc')}
            icon={PackagePlus}
            to="/createproduct"
          />

          {/* Create Survey */}
          <DashboardCard
            title={t('createSurvey')}
            description={t('createSurveyDesc')}
            icon={ClipboardList}
            to="/surveys/create"
          />
        </div>

        {/* Consultant Management */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gray-100 rounded-full">
                <UserCog className="w-6 h-6 text-gray-700" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">{t('consultantManagement')}</h2>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>{t('addNewConsultant')}</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-center text-xl font-semibold mb-4">{t('createNewConsultant')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium">{t('firstName')}</Label>
                    <Input
                      id="firstName"
                      value={newConsultant.firstName}
                      onChange={(e) => setNewConsultant({...newConsultant, firstName: e.target.value})}
                      className="mt-1"
                      placeholder={t('firstName')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="surname" className="text-sm font-medium">{t('surname')}</Label>
                    <Input
                      id="surname"
                      value={newConsultant.surname}
                      onChange={(e) => setNewConsultant({...newConsultant, surname: e.target.value})}
                      className="mt-1"
                      placeholder={t('surname')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">{t('email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newConsultant.email}
                      onChange={(e) => setNewConsultant({...newConsultant, email: e.target.value})}
                      className="mt-1"
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-sm font-medium">{t('password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newConsultant.password}
                      onChange={(e) => setNewConsultant({...newConsultant, password: e.target.value})}
                      className="mt-1"
                      placeholder="********"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <DialogClose asChild>
                      <Button variant="outline">{t('cancel')}</Button>
                    </DialogClose>
                    <Button 
                      onClick={handleCreateConsultant}
                      disabled={!newConsultant.firstName || !newConsultant.surname || !newConsultant.email || !newConsultant.password}
                    >
                      {t('createConsultant')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('email')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {consultants.map((consultant) => (
                  <tr key={consultant._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {`${consultant.firstName} ${consultant.surname}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{consultant.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button 
                        variant="destructive"
                        onClick={() => handleDeleteConsultant(consultant._id)}
                      >
                        {t('delete')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


