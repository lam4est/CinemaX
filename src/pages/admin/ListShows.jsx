import React, { useEffect, useState } from "react";
import { adminAPI } from "../../lib/api";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { dateFormat } from "../../lib/dateFormat";

const ListShows = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllShows = async () => {
    try {
      const data = await adminAPI.getAllShows();
      const showsList = Array.isArray(data) ? data : (data.results || []);
      setShows(showsList);
    } catch (error) {
      console.error('Error fetching shows:', error);
      setShows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() =>{
    getAllShows()
  }, [])

  return !loading ? (
    <>
        <Title text1="List" text2="Shows" />
        <div className="max-w-4xl mt-6 overflow-x-auto">
            <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
                <thead>
                    <tr className="bg-primary/20 text-left text-white">
                        <th className="p-2 font-medium pl-5">Movie Name</th>
                        <th className="p-2 font-medium">Show Time</th>
                        <th className="p-2 font-medium">Total Bookings</th>
                        <th className="p-2 font-medium">Earnings</th>
                    </tr>
                </thead>
                <tbody className="text-sm font-light">
                  {shows.length > 0 ? (
                    shows.map((show, index) => (
                      <tr key={show._id || show.id || index} className="border-b border-primary/10 bg-primary/5 even:bg-primary/10">
                          <td className="p-2 min-w-45 pl-5">{show.movie?.title || 'N/A'}</td>
                          <td className="p-2">{dateFormat(show.showDateTime || show.show_datetime)}</td>
                          <td className="p-2">{Object.keys(show.occupiedSeats || {}).length}</td>
                          <td className="p-2">
                              {currency} {Object.keys(show.occupiedSeats || {}).length * (show.showPrice || show.price || 0)}
                          </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-4 text-center text-gray-400">No shows found</td>
                    </tr>
                  )}
              </tbody>
            </table>
        </div>
    </>
  ) : <Loading />
};

export default ListShows;
