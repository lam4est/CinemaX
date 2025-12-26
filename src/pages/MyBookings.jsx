import React, { useEffect, useState } from "react";
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";
import { bookingsAPI } from "../lib/api";
import { dateFormat } from "../lib/dateFormat";
import timeFormat from "../lib/timeFormat";

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const getMyBookings = async () => {
    try {
      const data = await bookingsAPI.getMyBookings();
      const bookingsList = Array.isArray(data) ? data : (data.results || []);
      setBookings(bookingsList);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getMyBookings();
  }, []);

  return !isLoading ? (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <BlurCircle top="100px" left="100px" />
      <div>
        <BlurCircle bottom="0" left="600px" />
      </div>

      <h1 className="text-lg font-semibold mb-4">My Bookings</h1>

      {bookings.length > 0 ? (
        bookings.map((item, index) => (
          <div
            key={item._id || item.id || index}
            className="flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4
                                        p-2 max-w-3xl"
          >
            <div className="flex flex-col md:flex-row">
              <img
                src={item.movie?.poster_path || item.show?.movie?.poster_path}
                alt=""
                className="md:max-w-45 aspect-video h-auto object-cover object-bottom rounded"
              />
              <div className="flex flex-col p-4">
                <p className="text-lg font-semibold">{item.movie?.title || item.show?.movie?.title}</p>
                <p className="text-gray-400 text-sm">
                  {timeFormat(item.movie?.runtime || item.show?.movie?.runtime || 0)}
                </p>
                <p className="text-gray-400 text-sm mt-auto">
                  {item.show_time || item.show?.showDateTime || item.show?.show_datetime 
                    ? dateFormat(item.show_time || item.show?.showDateTime || item.show?.show_datetime)
                    : 'Date not available'}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:items-end md:text-right justify-between p-4">
              <div className="flex items-center gap-4">
                <p className="text-2xl font-semibold mb-3">
                  {currency}
                  {item.total_price || item.amount}
                </p>
                {!item.is_paid && (
                  <button className="bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer">
                    Pay Now
                  </button>
                )}
              </div>

              <div className="text-sm">
                <p>
                  <span className="text-gray-400">Total Tickets:</span>{" "}
                  {item.seats?.length || item.bookedSeats?.length || 0}
                </p>
                <p>
                  <span className="text-gray-400">Seat Number:</span>{" "}
                  {(item.seats || item.bookedSeats || []).join(", ")}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-400 mt-4">No bookings found</p>
      )}
    </div>
  ) : (
    <Loading />
  );
};

export default MyBookings;
