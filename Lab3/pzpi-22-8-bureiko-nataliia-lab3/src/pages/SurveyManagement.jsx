import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Search, Plus } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const SurveyManagement = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useLanguage();
  
  // Mock data - replace with actual API call
  const [surveys, setSurveys] = useState([
    {
      id: 1,
      title: "Customer Profile Insights",
      createdAt: "2024-03-15",
      status: "Active",
    },
    {
      id: 2,
      title: "Ideal Fragrance Match",
      createdAt: "2024-03-14",
      status: "Active",
    }
  ]);

  const filteredSurveys = surveys.filter((survey) =>
    survey.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSurvey = () => {
    navigate("/surveys/create");
  };

  const handleEditSurvey = (surveyId) => {
    navigate(`/surveys/${surveyId}/edit`);
  };

  const handleDeleteSurvey = (surveyId) => {
    if (window.confirm(t('confirmDelete') + " survey?")) {
      // Here you would typically make an API call to delete the survey
      const updatedSurveys = surveys.filter(survey => survey.id !== surveyId);
      setSurveys(updatedSurveys);
    }
  };

  const handleToggleStatus = (surveyId) => {
    const updatedSurveys = surveys.map(survey => {
      if (survey.id === surveyId) {
        return {
          ...survey,
          status: survey.status === "Active" ? "Closed" : "Active"
        };
      }
      return survey;
    });
    setSurveys(updatedSurveys);
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <h1 className="text-3xl font-bold text-center mb-8">{t('surveyManagement')}</h1>
      <Card>
        <div className="p-6">
          <div className="flex justify-end mb-6">
            <div className="flex gap-4">
              <div className="relative w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchSurveys')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button onClick={handleCreateSurvey}>
                {t('createSurvey')}
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center text-sm font-semibold">{t('title')}</TableHead>
                  <TableHead className="text-center text-sm font-semibold">{t('createdDate')}</TableHead>
                  <TableHead className="text-center text-sm font-semibold">{t('status')}</TableHead>
                  <TableHead className="text-center text-sm font-semibold">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSurveys.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell className="text-center text-sm">{survey.title}</TableCell>
                    <TableCell className="text-center text-sm">{survey.createdAt}</TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          survey.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {t(survey.status.toLowerCase())}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="focus:outline-none">
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0 hover:bg-slate-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onClick={() => handleEditSurvey(survey.id)}>
                            {t('editSurvey')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(survey.id)}>
                            {survey.status === "Active" ? t('closeSurvey') : t('activateSurvey')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteSurvey(survey.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            {t('deleteSurvey')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SurveyManagement; 