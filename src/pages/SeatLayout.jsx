import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { showsAPI, moviesAPI, bookingsAPI } from '../lib/api';
import { assets  } from '../assets/assets';
import Loading from '../components/Loading';
import { ArrowRightIcon, Clock } from 'lucide-react';
import isoTimeFormat from '../lib/isoTimeFormat';
import BlurCircle from '../components/BlurCircle';
import toast from 'react-hot-toast';

const SeatLayout = () => {

  const groupRows = [["A","B"], ["C","D"], ["E","F"], ["G","H"], ["I","J"]]

  const {id, date} = useParams();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState({}); // Ghế đã thanh toán
  const [bookedSeats, setBookedSeats] = useState({}); // Ghế đã book chưa thanh toán
  const navigate = useNavigate();

  const getShow = async() => {
    try {
      // Lấy movie detail
      const movie = await moviesAPI.getById(id);
      
      // Lấy shows cho movie này
      const showsData = await showsAPI.getByMovie(id);
      
      setShow({
        movie: movie,
        dateTime: showsData
      });
    } catch (error) {
      console.error('Error fetching show data:', error);
      toast.error('Failed to load show data');
    }
  }

  const handleSeatClick = async (seatId) => {
    if(!selectedTime) {
      return toast('Please select time first')
    }
    if(!selectedSeats.includes(seatId) && selectedSeats.length > 4){
      return toast('You can only select 5 seats')
    }
    
    // Load occupied seats when time is selected
    if (selectedTime && !occupiedSeats[selectedTime.time]) {
      try {
        const layoutData = await showsAPI.getLayout(id, selectedTime.time);
        setOccupiedSeats(prev => ({
          ...prev,
          [selectedTime.time]: layoutData.occupiedSeats || {}
        }));
        setBookedSeats(prev => ({
          ...prev,
          [selectedTime.time]: layoutData.bookedSeats || {}
        }));
      } catch (error) {
        console.error('Error loading seat layout:', error);
      }
    }
    
    setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(seat => seat !== seatId) : [...prev, seatId])
  }
  
  const handleTimeSelect = async (timeItem) => {
    setSelectedTime(timeItem);
    setSelectedSeats([]); // Reset seats when time changes
    
    // Load occupied seats for this time
    try {
      const layoutData = await showsAPI.getLayout(id, timeItem.time);
      setOccupiedSeats(prev => ({
        ...prev,
        [timeItem.time]: layoutData.occupiedSeats || {}
      }));
      setBookedSeats(prev => ({
        ...prev,
        [timeItem.time]: layoutData.bookedSeats || {}
      }));
    } catch (error) {
      console.error('Error loading seat layout:', error);
    }
  }

  const handleProceedToCheckout = async () => {
    if (!selectedTime || selectedSeats.length === 0) {
      toast.error('Vui lòng chọn thời gian và ghế ngồi');
      return;
    }

    try {
      toast.loading('Đang tạo booking...', { id: 'booking' });
      
      const bookingData = {
        showId: selectedTime.showId,
        seats: selectedSeats
      };

      const result = await bookingsAPI.create(bookingData);
      
      toast.success('Đặt vé thành công!', { id: 'booking' });
      
      // Chuyển sang trang thanh toán với booking ID
      navigate(`/checkout/${result._id}`, {
        state: {
          booking: result,
          movie: show.movie,
          showTime: selectedTime,
          seats: selectedSeats
        }
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi đặt vé', { id: 'booking' });
    }
  }

  const renderSeats = (row, count = 9) =>(
    <div key={row} className='flex gap-2 mt-2'>
      <div className='flex flex-wrap items-center justify-center gap-2'>
          {Array.from({length: count}, (_, i) => {
            const seatId = `${row}${i + 1}`;
            const isOccupied = selectedTime && occupiedSeats[selectedTime.time] && occupiedSeats[selectedTime.time][seatId];
            const isBooked = selectedTime && bookedSeats[selectedTime.time] && bookedSeats[selectedTime.time][seatId];
            const isSelected = selectedSeats.includes(seatId);
            return(
              <button 
                key={seatId} 
                onClick={() => handleSeatClick(seatId)}
                disabled={isOccupied}
                className={`h-8 w-8 rounded border border-primary/60 cursor-pointer 
                  ${isSelected ? 'bg-primary text-white' : ''}
                  ${isOccupied ? 'bg-red-500/50 cursor-not-allowed opacity-50' : ''}
                  ${isBooked && !isOccupied ? 'bg-yellow-500/70 hover:bg-yellow-500/80' : ''}
                  ${!isOccupied && !isBooked && !isSelected ? 'hover:bg-primary/20' : ''}
                `}>
                  {seatId}
              </button>
            )
          })}
      </div>
    </div>
  )

  useEffect(() => {
    getShow();
  }, [])

  return show ?  (
    <div className='flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50'>
        <div className='w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30'>
            <p className='text-lg font-semibold px-6 '>Available Timings</p>

            <div className='mt-5 space-y-1'>
              {show.dateTime && show.dateTime[date] ? (
                show.dateTime[date].map((item) => (
                  <div key={item.time} onClick={() => handleTimeSelect(item)} className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition
                   ${selectedTime?.time === item.time ? 'bg-primary text-white' : 'hover:bg-primary/20'}`}>
                    <Clock className='w-4 h-4' />
                    <p className='text-sm'> {isoTimeFormat(item.time)}</p>
                  </div>
                ))
              ) : (
                <div className='px-6 text-red-500'>No shows available for this date</div>
              )}
            </div>
        </div>

        <div className='relative flex-1 flex flex-col items-center max-md:mt-16'>
              <BlurCircle top='-100px' left='-100px'/>
              <BlurCircle top='0' left='0'/>
              <h1 className='text-2xl font-semibold mb-4'>Select your seat</h1>
              <img src={assets.screenImage} alt="screen" />
              <p className='text-gray-400 text-sm mb-6'>
                SCREEN SIDE
              </p>

              {/* Legend cho màu ghế */}
              <div className='flex gap-4 mb-4 text-xs text-gray-400'>
                <div className='flex items-center gap-2'>
                  <div className='h-6 w-6 rounded border border-primary/60 bg-primary/20'></div>
                  <span>Available</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='h-6 w-6 rounded border border-primary/60 bg-yellow-500/70'></div>
                  <span>Booked</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='h-6 w-6 rounded border border-primary/60 bg-red-500/50 opacity-50'></div>
                  <span>Sold</span>
                </div>
              </div>

              <div className='flex flex-col items-center mt-10 text-xs text-gray-300 '>
                  <div className='grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6'>
                      {groupRows[0].map(row => renderSeats(row))}
                  </div>

                  <div className='grid grid-cols-2 gap-11'>
                {groupRows.slice(1).map((group, idx) => (
                  <div key={idx}>
                    {group.map(row => renderSeats(row))}
                  </div>
                ))}
              </div>
              </div>

              <button 
                onClick={handleProceedToCheckout} 
                disabled={!selectedTime || selectedSeats.length === 0}
                className='flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary
                hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed'>
                Proceed to Checkout 
                <ArrowRightIcon strokeWidth={3} className='w-4 h-4' />
              </button>
        </div>
    </div>
  ) : <Loading />;
}

export default SeatLayout