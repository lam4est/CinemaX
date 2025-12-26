import React from "react";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Movies from "./pages/Movies.jsx";
import MovieDetails from "./pages/MovieDetails.jsx";
import SeatLayout from "./pages/SeatLayout.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import Favorite from "./pages/Favorite.jsx";
import Checkout from "./pages/Checkout.jsx";
import Reviews from "./pages/Reviews.jsx";
import { useClerkToken } from "./hooks/useClerkToken.js";
import { useAdminRedirect } from "./hooks/useAdminRedirect.js";
import Footer from "./components/Footer.jsx";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./pages/admin/Layout.jsx";
import ListShows from "./pages/admin/ListShows.jsx";
import ListBookings from "./pages/admin/ListBookings.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import AddShows from "./pages/admin/AddShows.jsx";
import ListMovies from "./pages/admin/ListMovies.jsx";
import AddEditMovie from "./pages/admin/AddEditMovie.jsx";

const App = () => {
  // Lấy và lưu Clerk token vào localStorage
  useClerkToken();
  
  // Check admin role và redirect
  useAdminRedirect();

  const isAdminRoute = useLocation().pathname.startsWith('/admin'); 

  return (
    <div>
      <Toaster />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/movies/:id/:date" element={<SeatLayout />} />
        <Route path="/checkout/:bookingId" element={<Checkout />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/favorite" element={<Favorite />} />
        <Route path="/movies/:movieId/reviews" element={<Reviews />} />
        <Route path='/admin/*' element={<Layout/>}>
            <Route index element={<Dashboard/>}/>
            <Route path="movies" element={<ListMovies/>}/>
            <Route path="movies/add" element={<AddEditMovie/>}/>
            <Route path="movies/edit/:id" element={<AddEditMovie/>}/>
            <Route path="add-shows" element={<AddShows/>}/>
            <Route path="list-shows" element={<ListShows/>}/>
            <Route path="list-bookings" element={<ListBookings/>}/>
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default App;
