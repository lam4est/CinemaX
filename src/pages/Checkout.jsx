import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { bookingsAPI } from '../lib/api';
import Loading from '../components/Loading';
import BlurCircle from '../components/BlurCircle';
import { ArrowLeftIcon, CreditCard, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { dateFormat } from '../lib/dateFormat';
import isoTimeFormat from '../lib/isoTimeFormat';

const Checkout = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const currency = import.meta.env.VITE_CURRENCY || '₫';
  
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [movie, setMovie] = useState(location.state?.movie || null);
  const [showTime, setShowTime] = useState(location.state?.showTime || null);
  const [seats, setSeats] = useState(location.state?.seats || []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(!booking);

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const paypalButtonRef = useRef(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  // Reset PayPal loaded state when payment method changes
  useEffect(() => {
    if (paymentMethod !== 'paypal') {
      setPaypalLoaded(false);
    }
  }, [paymentMethod]);

  useEffect(() => {
    // Nếu không có state, có thể fetch booking từ API
    if (!booking && bookingId) {
      // Có thể thêm API để lấy booking detail nếu cần
      setIsLoading(false);
    }
  }, [bookingId, booking]);

  // Load PayPal SDK
  useEffect(() => {
    // Chỉ load PayPal khi chọn phương thức PayPal
    if (paymentMethod !== 'paypal') {
      return;
    }

    const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    
    if (!paypalClientId || paypalClientId === 'YOUR_PAYPAL_CLIENT_ID') {
      console.warn('PayPal Client ID chưa được cấu hình');
      return;
    }

    // Kiểm tra xem script đã được load chưa
    const existingScript = document.querySelector(`script[src*="paypal.com/sdk"]`);
    
    if (existingScript) {
      // Script đã có, chỉ cần render button
      if (window.paypal && paypalButtonRef.current && !paypalLoaded) {
        setTimeout(() => {
          initPayPalButton();
        }, 100);
      }
      return;
    }

    // Load PayPal SDK script
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD`;
    script.async = true;
    script.onload = () => {
      console.log('PayPal SDK loaded');
      if (window.paypal && paypalButtonRef.current) {
        setTimeout(() => {
          initPayPalButton();
        }, 100);
      }
    };
    script.onerror = () => {
      console.error('Failed to load PayPal SDK');
      toast.error('Không thể tải PayPal SDK');
    };
    document.body.appendChild(script);

    return () => {
      // Không cleanup script để tránh reload nhiều lần
    };
  }, [paymentMethod, bookingId]);

  const initPayPalButton = () => {
    if (!paypalButtonRef.current || !window.paypal) {
      console.log('PayPal button ref or SDK not ready', {
        hasRef: !!paypalButtonRef.current,
        hasPayPal: !!window.paypal
      });
      return;
    }

    // Clear previous button if exists
    if (paypalButtonRef.current.innerHTML) {
      paypalButtonRef.current.innerHTML = '';
    }

    try {
      window.paypal.Buttons({
        createOrder: async (data, actions) => {
          try {
            console.log('Creating PayPal order for booking:', bookingId);
            
            // Lấy thông tin booking để tính tổng tiền
            const totalPrice = booking?.total_price || (showTime?.price * seats.length) || 0;
            const movieTitle = movie?.title || 'Movie Ticket';
            
            try {
              // Thử tạo order qua API backend trước
              const orderData = await bookingsAPI.createPaypalOrder(bookingId);
              console.log('PayPal order created via API:', orderData);
              
              // Nếu có order_id và không phải mock (không có warning), dùng nó
              if (orderData.order_id && !orderData.warning) {
                return orderData.order_id;
              }
              
              // Nếu là mock order, tạo order trực tiếp qua PayPal SDK
              console.log('Using PayPal SDK to create order (API returned mock)');
            } catch (apiError) {
              console.warn('API error, creating order via PayPal SDK:', apiError);
              // Tiếp tục tạo order qua PayPal SDK
            }
            
            // Tạo order trực tiếp qua PayPal SDK
            return actions.order.create({
              purchase_units: [{
                reference_id: bookingId,
                amount: {
                  value: totalPrice.toFixed(2),
                  currency_code: 'USD'
                },
                description: `Booking for ${movieTitle}`
              }]
            });
          } catch (error) {
            console.error('Error creating PayPal order:', error);
            toast.error('Không thể tạo đơn hàng PayPal: ' + (error.message || 'Unknown error'));
            throw error;
          }
        },
        onApprove: async (data, actions) => {
          try {
            console.log('PayPal order approved:', data);
            setIsProcessing(true);
            toast.loading('Đang xử lý thanh toán PayPal...', { id: 'paypal' });
            
            // Capture order nếu cần (cho server-side)
            // const details = await actions.order.capture();
            // console.log('Order captured:', details);
            
            const result = await bookingsAPI.payment(bookingId, {
              payment_method: 'paypal',
              paypal_order_id: data.orderID
            });
            
            console.log('Payment processed:', result);
            toast.success('Thanh toán PayPal thành công!', { id: 'paypal' });
            
            setTimeout(() => {
              navigate('/my-bookings');
            }, 1500);
          } catch (error) {
            console.error('Error processing PayPal payment:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi thanh toán PayPal', { id: 'paypal' });
            setIsProcessing(false);
          }
        },
        onError: (err) => {
          console.error('PayPal error:', err);
          toast.error('Có lỗi xảy ra với PayPal');
          setIsProcessing(false);
        },
        onCancel: () => {
          toast.error('Thanh toán PayPal đã bị hủy');
          setIsProcessing(false);
        }
      }).render(paypalButtonRef.current);
      
      setPaypalLoaded(true);
      console.log('PayPal button rendered successfully');
    } catch (error) {
      console.error('Error rendering PayPal button:', error);
      toast.error('Không thể hiển thị nút PayPal');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      toast.error('Vui lòng điền đầy đủ thông tin thanh toán');
      return;
    }

    setIsProcessing(true);
    try {
      toast.loading('Đang xử lý thanh toán...', { id: 'payment' });
      
      const paymentData = {
        payment_method: paymentMethod,
        card_number: cardNumber.replace(/\s/g, ''),
        card_name: cardName,
        expiry_date: expiryDate,
        cvv: cvv
      };

      const result = await bookingsAPI.payment(bookingId, paymentData);
      
      toast.success('Thanh toán thành công!', { id: 'payment' });
      
      // Chuyển sang trang my-bookings sau 1.5 giây
      setTimeout(() => {
        navigate('/my-bookings');
      }, 1500);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi thanh toán', { id: 'payment' });
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  if (isLoading) {
    return <Loading />;
  }

  const totalPrice = booking?.total_price || (showTime?.price * seats.length) || 0;

  return (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh] pb-20">
      <BlurCircle top="100px" left="100px" />
      <BlurCircle bottom="0" right="100px" />

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-gray-400 hover:text-white transition"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Quay lại</span>
      </button>

      <h1 className="text-2xl font-semibold mb-8">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Thông tin đơn hàng */}
        <div className="lg:col-span-2">
          <div className="bg-primary/8 border border-primary/20 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Thông tin thanh toán
            </h2>

            <form onSubmit={handlePayment} className="space-y-4">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium mb-2">Phương thức thanh toán</label>
                <div className="flex gap-4 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`px-4 py-2 rounded-lg border transition ${
                      paymentMethod === 'card'
                        ? 'bg-primary border-primary text-white'
                        : 'border-primary/20 hover:border-primary/40'
                    }`}
                  >
                    Thẻ tín dụng
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`px-4 py-2 rounded-lg border transition ${
                      paymentMethod === 'paypal'
                        ? 'bg-primary border-primary text-white'
                        : 'border-primary/20 hover:border-primary/40'
                    }`}
                  >
                    PayPal
                  </button>
                </div>
              </div>

              {paymentMethod === 'card' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Số thẻ</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg focus:outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tên chủ thẻ</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      placeholder="NGUYEN VAN A"
                      className="w-full px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg focus:outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Ngày hết hạn</label>
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg focus:outline-none focus:border-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">CVV</label>
                      <input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="123"
                        maxLength={3}
                        className="w-full px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : paymentMethod === 'paypal' ? (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-4">
                    Thanh toán an toàn qua PayPal
                  </p>
                  <div 
                    ref={paypalButtonRef} 
                    className="flex justify-center min-h-[50px]"
                    id="paypal-button-container"
                  ></div>
                  {!import.meta.env.VITE_PAYPAL_CLIENT_ID || import.meta.env.VITE_PAYPAL_CLIENT_ID === 'YOUR_PAYPAL_CLIENT_ID' ? (
                    <p className="text-xs text-red-400 mt-2">
                      Vui lòng cấu hình VITE_PAYPAL_CLIENT_ID trong file .env
                    </p>
                  ) : !paypalLoaded && window.paypal ? (
                    <p className="text-xs text-yellow-400 mt-2">
                      Đang tải nút PayPal...
                    </p>
                  ) : null}
                </div>
              ) : null}

              {paymentMethod === 'card' && (
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-6 px-6 py-3 bg-primary hover:bg-primary-dull transition rounded-lg font-medium cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Thanh toán {currency}{totalPrice.toLocaleString()}</span>
                    </>
                  )}
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="lg:col-span-1">
          <div className="bg-primary/8 border border-primary/20 rounded-lg p-6 sticky top-30">
            <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>

            {movie && (
              <div className="mb-4">
                <img
                  src={movie.poster_path}
                  alt={movie.title}
                  className="w-full aspect-video object-cover rounded-lg mb-4"
                />
                <h3 className="font-semibold text-lg">{movie.title}</h3>
              </div>
            )}

            <div className="space-y-2 text-sm mb-4">
              {showTime && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Thời gian:</span>
                  <span>{isoTimeFormat(showTime.time)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-400">Ngày:</span>
                <span>{showTime ? dateFormat(showTime.time) : '-'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Số ghế:</span>
                <span>{seats.join(', ')}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Số lượng vé:</span>
                <span>{seats.length}</span>
              </div>
            </div>

            <div className="border-t border-primary/20 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Tổng cộng:</span>
                <span className="text-2xl font-bold text-primary">
                  {currency}{totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

