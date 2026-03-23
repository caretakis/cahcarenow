import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppLayout } from "@/components/AppLayout";
import WorkQueuesHome from "@/pages/WorkQueuesHome";
import WorkQueue from "@/pages/WorkQueue";
import ChaseListsHome from "@/pages/ChaseListsHome";
import ChaseListBuilder from "@/pages/ChaseListBuilder";
import ChaseListRun from "@/pages/ChaseListRun";
import TOCHome from "@/pages/TOCHome";
import TOCEpisode from "@/pages/TOCEpisode";
import ProgramsHome from "@/pages/ProgramsHome";
import ProgramPanel from "@/pages/ProgramPanel";
import MedAdherenceHome from "@/pages/MedAdherenceHome";
import PatientsSearch from "@/pages/PatientsSearch";
import PatientPage from "@/pages/PatientPage";
import SiteDashboard from "@/pages/SiteDashboard";
import CentralDashboard from "@/pages/CentralDashboard";
import ManagerDashboard from "@/pages/ManagerDashboard";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<ManagerDashboard />} />
            <Route path="/queues" element={<WorkQueuesHome />} />
            <Route path="/queues/:queueId" element={<WorkQueue />} />
            <Route path="/lists" element={<ChaseListsHome />} />
            <Route path="/lists/builder" element={<ChaseListBuilder />} />
            <Route path="/lists/:listId" element={<ChaseListRun />} />
            <Route path="/toc" element={<TOCHome />} />
            <Route path="/toc/episode/:episodeId" element={<TOCEpisode />} />
            <Route path="/programs" element={<ProgramsHome />} />
            <Route path="/programs/:programId" element={<ProgramPanel />} />
            <Route path="/med-adherence" element={<MedAdherenceHome />} />
            <Route path="/patients" element={<PatientsSearch />} />
            <Route path="/patients/:patientId" element={<PatientPage />} />
            <Route path="/dashboards/manager" element={<ManagerDashboard />} />
            <Route path="/dashboards/site" element={<SiteDashboard />} />
            <Route path="/dashboards/central" element={<CentralDashboard />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
