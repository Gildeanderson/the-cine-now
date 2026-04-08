import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import MovieDetailsPage from './components/MovieDetailsPage';
import TVDetailsPage from './components/TVDetailsPage';
import PersonDetailsPage from './components/PersonDetailsPage';
import SearchPage from './components/SearchPage';
import ProfilePage from './components/ProfilePage';
import ForYouPage from './components/ForYouPage';
import MyListPage from './components/MyListPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import { AuthProvider } from './context/AuthContext';
import AuthGuard from './components/AuthGuard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Main Layout with Public and Protected Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="movie/:id" element={<MovieDetailsPage />} />
            <Route path="tv/:id" element={<TVDetailsPage />} />
            <Route path="person/:id" element={<PersonDetailsPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="foryou" element={<ForYouPage />} />
            
            {/* Protected Routes */}
            <Route
              path="profile"
              element={
                <AuthGuard>
                  <ProfilePage />
                </AuthGuard>
              }
            />
            <Route
              path="mylist"
              element={
                <AuthGuard>
                  <MyListPage />
                </AuthGuard>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
