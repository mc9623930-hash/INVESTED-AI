import { Switch, Route, Router as WouterRouter } from 'wouter';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { SimulatorProvider } from './context/SimulatorContext';
import Navbar from './components/layout/Navbar';

import Landing from './pages/Landing';
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import GooglePopup from './pages/Auth/GooglePopup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import AIChatWidget from './components/chat/AIChatWidget';
import RiskQuiz from './pages/Onboarding/RiskQuiz';
import OnboardingResult from './pages/Onboarding/OnboardingResult';
import AcademyHome from './pages/Academy/AcademyHome';
import ModuleView from './pages/Academy/ModuleView';
import LessonView from './pages/Academy/LessonView';
import Portfolio from './pages/Simulator/Portfolio';
import ResearchHome from './pages/Research/ResearchHome';
import StockDetail from './pages/Research/StockDetail';
import FundDetail from './pages/Research/FundDetail';
import RoundsHome from './pages/SituationRounds/RoundsHome';
import RoundPlay from './pages/SituationRounds/RoundPlay';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import Profile from './pages/Profile/Profile';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">📭</div>
        <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
        <a href="/" className="text-secondary hover:underline">Go Home</a>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={SignUp} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/auth/google-popup" component={GooglePopup} />
        <Route path="/onboarding/quiz" component={RiskQuiz} />
        <Route path="/onboarding/result" component={OnboardingResult} />
        <Route path="/academy" component={AcademyHome} />
        <Route path="/academy/:moduleId/lesson/:lessonId" component={LessonView} />
        <Route path="/academy/:moduleId" component={ModuleView} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/research/fund/:fundCode" component={FundDetail} />
        <Route path="/research/:ticker" component={StockDetail} />
        <Route path="/research" component={ResearchHome} />
        <Route path="/rounds/:roundId" component={RoundPlay} />
        <Route path="/rounds" component={RoundsHome} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <SimulatorProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <AppRoutes />
          </WouterRouter>
          <AIChatWidget />
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'font-sans text-sm',
              style: {
                borderRadius: '12px',
                background: '#1E3A5F',
                color: '#fff',
              },
            }}
          />
        </SimulatorProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
