import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { loadLegacyScripts } from "./lib/loadLegacyScripts";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Activity from "./pages/Activity";
import AddActivity from "./pages/AddActivity";
import Chat from "./pages/Chat";
import Event from "./pages/Event/Event";
import AddEvent from "./pages/Event/Addevent";
import EventSeries from "./pages/Event/EventSeries";
import Login from "./pages/Auth/Login";
import People from "./pages/People";
import Places from "./pages/Places";
import Signup from "./pages/Auth/Signup";
import UserProfile from "../src/pages/Auth/UserProfile";
import UserSetting from "../src/pages/Auth/UserSetting";
import ViewClub from "./pages/ViewClub";
import ClubList from "./pages/ClubList";
import ClubDetail from "./pages/ClubDetail";
import CreateClub from "./pages/CreateClub";
import GroupDetail from "./pages/GroupDetail";
import Footer from "./components/Footer";
import TermsCondition from "./pages/TermsCondition";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ContactUs from "./pages/ContactUs";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import AboutUs from "./pages/AboutUs";
import FAQ from "./pages/FAQ";
import PostDetail from "./pages/PostDetail";

import Search from "./pages/Search";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}



function RoutesWithInit() {
  const location = useLocation();

  useEffect(() => {
    loadLegacyScripts()
      .then(() => {
        if (typeof window.__clubOrbitSpaInit === "function") window.__clubOrbitSpaInit();
      })
      .catch(() => {
      });
  }, [location.pathname]);

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terms-condition" element={<TermsCondition />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/contact-us" element={<ContactUs />} />

        <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
        <Route path="/add-activity" element={<ProtectedRoute><AddActivity /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/event" element={<ProtectedRoute><Event /></ProtectedRoute>} />
        <Route path="/add-event" element={<ProtectedRoute><AddEvent /></ProtectedRoute>} />
        <Route path="/people" element={<ProtectedRoute><People /></ProtectedRoute>} />
        <Route path="/places" element={<ProtectedRoute><Places /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/user-profile/:uid?" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/user-setting-password" element={<ProtectedRoute><UserSetting /></ProtectedRoute>} />
        <Route path="/view-club" element={<ProtectedRoute><ViewClub /></ProtectedRoute>} />
        <Route path="/clubs" element={<ProtectedRoute><ClubList /></ProtectedRoute>} />
        <Route path="/clubs/create" element={<ProtectedRoute><CreateClub /></ProtectedRoute>} />
        <Route path="/clubs/:clubId" element={<ProtectedRoute><ClubDetail /></ProtectedRoute>} />
        <Route path="/groups/:groupId" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
        <Route path="/event-series/:eventSeriesId" element={<ProtectedRoute><EventSeries /></ProtectedRoute>} />
        <Route path="/post/:postId" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
      </Routes>
      {location.pathname !== "/search" && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RoutesWithInit />
      </AuthProvider>
    </BrowserRouter>
  );
}