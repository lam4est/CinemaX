import React from 'react'
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import BlurCircle from './BlurCircle'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import toast from 'react-hot-toast';

const DateSelect = ({dateTime, id, movie}) => {
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null);

    // dateTime có thể là object (từ backend) hoặc array (dummy data)
    const dateTimeObject = useMemo(() => {
        if (!dateTime) {
            return {};
        }
        
        // Nếu là object (format từ backend), dùng trực tiếp
        if (!Array.isArray(dateTime) && typeof dateTime === 'object') {
            return dateTime;
        }
        
        // Nếu là array, format thành object
        if (Array.isArray(dateTime)) {
            const datesMap = {};
            dateTime.forEach(show => {
                if (show.showDateTime) {
                    const date = new Date(show.showDateTime);
                    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
                    if (!datesMap[dateKey]) {
                        datesMap[dateKey] = [];
                    }
                    datesMap[dateKey].push(show);
                }
            });
            return datesMap;
        }
        
        return {};
    }, [dateTime]);

    const onBookHandler = () => {
        if(!selected) {
            return toast("Please select a date first");
        }
        navigate(`/movies/${id}/${selected}`);
        scrollTo(0,0);
    }

    // Filter dates: chỉ hiển thị dates từ release_date trở đi
    const filteredDates = useMemo(() => {
        const allDates = Object.keys(dateTimeObject).sort();
        
        if (!movie || !movie.release_date) {
            return allDates;
        }
        
        try {
            const releaseDateStr = movie.release_date.replace('Z', '+00:00');
            const releaseDate = new Date(releaseDateStr);
            releaseDate.setHours(0, 0, 0, 0);
            
            return allDates.filter(dateStr => {
                const date = new Date(dateStr);
                date.setHours(0, 0, 0, 0);
                return date >= releaseDate;
            });
        } catch (e) {
            console.error('Error filtering dates:', e);
            return allDates;
        }
    }, [dateTimeObject, movie]);

    const dates = filteredDates;

    if (dates.length === 0) {
        return (
            <div id="dateSelect" className='pt30'>
                <div className='flex flex-col items-center justify-center p-8 bg-primary/10 border border-primary/20 rounded-lg'>
                    <p className='text-lg font-semibold text-gray-400'>No shows available</p>
                </div>
            </div>
        );
    }

    return (
        <div id="dateSelect" className='pt30'>
            <div className='flex flex-col md:flex-row items-center justify-between gap-10 relative p-8 bg-primary/10 border border-primary/20 rounded-lg'>
                <BlurCircle top="-100px" left="-100px" />
                <BlurCircle top="100px" right="0" />
                <div>
                    <p className='text-lg font-semibold'>Choose Date</p>
                    <div className='flex items-center gap-6 text-sm mt-5'>
                        <ChevronLeftIcon width={28} />
                        <span className='grid grid-cols-3 md:flex flex-wrap md:max-w-lg gap-4'>
                            {dates.map((date) => (
                                <button key={date} className={`flex flex-col justify-center items-center h-14 w-14 aspect-square rounded cursor-pointer ${selected === date ? 'bg-primary text-white' : 'border border-primary/70'}`} onClick={() => setSelected(date)}>
                                    <span>{new Date(date).getDate()}</span>
                                    <span>{new Date(date).toLocaleDateString("en-US",{month:"short"})}</span>
                                </button>
                            ))}
                        </span>
                        <ChevronRightIcon width={28} />
                    </div>
                </div>
                <button onClick={onBookHandler} className='bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary-90 transition-all cursor-pointer'>
                    Book Now
                </button>
            </div>
        </div>
    )
}

export default DateSelect