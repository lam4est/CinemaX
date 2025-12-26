export const dateFormat = (date) => {
    if (!date) {
        return 'Invalid Date';
    }
    
    try {
        // Xử lý ISO format với Z
        let dateObj;
        if (typeof date === 'string') {
            // Thay Z bằng +00:00 để parse đúng
            const dateStr = date.replace('Z', '+00:00');
            dateObj = new Date(dateStr);
        } else {
            dateObj = new Date(date);
        }
        
        // Kiểm tra date hợp lệ
        if (isNaN(dateObj.getTime())) {
            return 'Invalid Date';
        }
        
        return dateObj.toLocaleString('en-US', {
            weekday: 'short',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error, date);
        return 'Invalid Date';
    }
}