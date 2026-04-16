import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppLayout } from "@/components/AppLayout";
import { UserRoleProvider } from "@/contexts/UserRoleContext";
import PopulationView from "@/pages/PopulationView";
import MyPanel from "@/pages/MyPanel";
import CareTiers from "@/pages/CareTiers";
import WorkQueuesHome from "@/pages/WorkQueuesHome";
import WorkQueue from "@/pages/WorkQueue";
import ChaseListsPage from "@/pages/ChaseListsPage";
import ChaseListBuilder from "@/pages/ChaseListBuilder";
import TOCHome from "@/pages/TOCHome";
import TOCEpisode from "@/pages/TOCEpisode";
import ProgramsHome from "@/pages/ProgramsHome";
import ProgramPanel from "@/pages/ProgramPanel";
import DMEpisode from "@/pages/DMEpisode";
import MedAdherenceHome from "@/pages/MedAdherenceHome";
import PatientsSearch from "@/pages/PatientsSearch";
import PatientPage from "@/pages/PatientPage";
import SiteDashboard from "@/pages/SiteDashboard";
import CentralDashboard from "@/pages/CentralDashboard";
import ManagerDashboard from "@/pages/ManagerDashboard";
import ListManagement from "@/pages/ListManagement";
import ListDetail from "@/pages/ListDetail";
import TeamProductivity from "@/pages/TeamProductivity";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <UserRoleProvider>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/population" replace />} />
                <Route path="/population" element={<PopulationView />} />
                <Route path="/panel" element={<MyPanel />} />
                <Route path="/care-tiers" element={<CareTiers />} />
                <Route path="/queues" element={<WorkQueuesHome />} />
                <Route path="/queues/:queueId" element={<WorkQueue />} />
                <Route path="/lists" element={<ChaseListsPage />} />
                <Route path="/lists/builder" element={<ChaseListBuilder />} />
                <Route path="/toc" element={<TOCHome />} />
                <Route path="/toc/episode/:episodeId" element={<TOCEpisode />} />
                <Route path="/programs" element={<ProgramsHome />} />
                <Route path="/programs/:programId" element={<ProgramPanel />} />
                <Route path="/programs/enrollment/:enrollmentId" element={<DMEpisode />} />
                <Route path="/med-adherence" element={<MedAdherenceHome />} />
                <Route path="/patients" element={<PatientsSearch />} />
                <Route path="/patients/:patientId" element={<PatientPage />} />
                <Route path="/dashboards/manager" element={<ManagerDashboard />} />
                <Route path="/dashboards/site" element={<SiteDashboard />} />
                <Route path="/dashboards/central" element={<CentralDashboard />} />
                <Route path="/manager/lists" element={<ListManagement />} />
                <Route path="/manager/lists/:listId" element={<ListDetail />} />
                <Route path="/manager/productivity" element={<TeamProductivity />} />
                <Route path="/admin" element={<Admin />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </UserRoleProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
