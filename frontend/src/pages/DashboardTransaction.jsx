import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '../context/AdminThemeContext';
import AdminSearchBar from '../components/adminSearchBar';
import DashboardNavbar from '../components/DashboardNavbar';
import { useAuthContext } from '../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { HiOutlineRefresh } from "react-icons/hi";
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import ViewTransaction from '../components/ViewTransaction';
import { API_DOMAIN } from '../utils/constants';


// This component is used to display all sales orders in the dashboard.
const DashboardTransaction = () => {
    const { user } = useAuthContext();
    const { darkMode } = useAdminTheme();
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [loading, setLoading] = useState(false);
    const [salesOrder, setSalesOrder] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [cashierName, setCashierName] = useState('');
    const [showViewPanel, setShowViewPanel] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [customerName, setCustomerName] = useState(''); // Add this line
    const [paymentMethod, setPaymentMethod] = useState(''); // State to hold selected payment method
    const [filteredSalesOrder, setFilteredSalesOrder] = useState([]);

    const handlePaymentMethodChange = (e) => {
      setPaymentMethod(e.target.value);
      // Trigger fetching transactions with the selected payment method
      fetchTransactions(e.target.value); // Ensure you implement fetchTransactions to handle the API call
    };

    const [statusFilters, setStatusFilters] = useState({
      Completed: false,
      Refunded: false,
      Replaced: false,
    });
    
    const handleCheckboxChange = (status) => {
      setStatusFilters(prevFilters => ({
        ...prevFilters,
        [status]: !prevFilters[status],
      }));
    
      fetchSalesOrders();  
    };
    
    
    const handleViewTransaction = (transaction, item) => {
      if (showViewPanel) {
        setShowViewPanel(false); // Close if it's already open
      } else {
        closeAllPanels(); // Close other panels before opening
        setSelectedTransaction({ ...transaction, product: item });
        setShowViewPanel(true); // Open the View panel
      }
    };
    
    const closeAllPanels = () => {
      setShowViewPanel(false);
    };
    
    // This is the update to ensure the state is set correctly
    useEffect(() => {
      if (!showViewPanel) {
        setSelectedTransaction(null);
      }
    }, [showViewPanel]);
    
  

    useEffect(() => {
      if (user) {
        fetchSalesOrders();
      }
    }, [startDate, endDate, minPrice, maxPrice, sortBy, searchQuery, cashierName, user, statusFilters, customerName, paymentMethod]);
    
    const fetchSalesOrders = async () => {
      setLoading(true);
      
      try {
        const response = await axios.get(`${API_DOMAIN}/transaction`, {
          params: {
            payment_status: 'paid',
            transaction_id: searchQuery,
            cashier: cashierName,
            customer: customerName,
            startDate: startDate ? startDate.toISOString() : undefined,
            endDate: endDate ? endDate.toISOString() : undefined,
            sortBy: sortBy,
            payment_method: paymentMethod,
            statusFilters: JSON.stringify(statusFilters), // Send the status filters
          },
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });
    
        setSalesOrder(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sales orders:', error);
        setLoading(false);
      }
    };

 

      const handleStartDateChange = (date) => setStartDate(date);
      const handleEndDateChange = (date) => setEndDate(date);
      const handleMinPriceChange = (event) => setMinPrice(event.target.value);
      const handleMaxPriceChange = (event) => setMaxPrice(event.target.value);
      const handleCashierNameChange = (event) => setCashierName(event.target.value);
      const handleResetFilters = () => {
        setStartDate(null);
        setEndDate(null);
        setMinPrice('');
        setMaxPrice('');
        setCashierName('');
        setCustomerName('');
        setStatusFilters({
          Completed: false,
          Refunded: false,
        });
      };
      
      


      const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options).replace(/^(.*?), (.*), (.*)$/, (match, month, day, year) => {
          return `${month.charAt(0).toUpperCase() + month.slice(1)} ${day}, ${year}`;
        });
      };
      
      
      const getStatusStyles = (status) => {
        switch (status) {
          case 'Completed':
            return {
              textClass: 'text-[#14AE5C]',
              bgClass: 'bg-[#CFF7D3]', 
            };
          case 'Refunded':
            return {
              textClass: 'text-[#EC221F]',
              bgClass: 'bg-[#FEE9E7]',
            };
            case 'RMA':
              return {
                textClass: 'text-[#BF6A02]',
                bgClass: 'bg-[#FFF1C2]',
              };
              case 'Replaced':
                return {
                  textClass: 'text-[#007BFF]',
                  bgClass: 'bg-[#C2D7FF]',
                };
          default:
            return {
              textClass: 'text-[#8E8E93]',
              bgClass: 'bg-[#E5E5EA]',
            };
        }
      };

    

    return (
        <div className={`w-full h-full ${darkMode ? 'bg-light-bg' : 'bg-dark-bg'}`}>
            <ToastContainer theme={darkMode ? 'light' : 'dark'} />
            <DashboardNavbar />
            <div className='pt-[70px] px-6 py-4 w-full h-full'>
                <div className='flex items-center justify-center py-5'>
                    <h1 className={`w-full text-3xl font-bold ${darkMode ? 'text-light-textPrimary' : 'text-dark-textPrimary'}`}>Sales Transaction</h1>
                    <div className='w-full flex justify-end gap-2'>
                        <AdminSearchBar query={searchQuery} onQueryChange={setSearchQuery}  placeholderMessage={'Search Transaction by transaction id'} />
                    </div>
                </div>
                <div className='flex gap-4'>
                    <div className={`h-[78vh] max-h-[84%] w-[22%] rounded-2xl p-4 flex flex-col justify-between overflow-y-auto ${darkMode ? 'bg-light-container' : 'dark:bg-dark-container'}`}>
                      <div className={`flex flex-col gap-6 ${darkMode ? 'text-light-textPrimary' : 'dark:text-dark-textPrimary'}`}>

                          <div className='flex flex-col gap-2'>
                              <div className='flex flex-col'>
                              <label htmlFor='customerName' className={`text-md font-semibold ${darkMode ? 'text-dark-border' : 'dark:text-light-border'}`}>CUSTOMER NAME</label>
                                <input
                                  type='text'
                                  placeholder='Enter Customer Name'
                                  value={customerName}
                                  onChange={(e) => setCustomerName(e.target.value)}
                                  className={`border rounded bg-transparent border-3 pl-1 ${darkMode ? 'border-light-textSecondary' : 'dark:border-dark-textSecondary'} w-full p-2`}
                                  />
                              </div>

                              <div className='flex flex-col gap-2'>
                              <label htmlFor='cashierName' className={`text-md font-semibold ${darkMode ? 'text-dark-border' : 'dark:text-light-border'}`}>CASHIER NAME</label>
                                    <input
                                    type='text'
                                    placeholder='Enter Cashier Name'
                                    value={cashierName}
                                    onChange={(e) => setCashierName(e.target.value)}
                                    className={`border rounded bg-transparent border-3 pl-1 ${darkMode ? 'border-light-textSecondary' : 'dark:border-dark-textSecondary'} w-full p-2`}
                                    />
                              </div>

                              <div className='flex flex-col gap-2 py-2'>
                                <span className={`text-md font-semibold ${darkMode ? 'text-dark-border' : 'dark:text-light-border'}`}>TRANSACTION STATUS</span>
                                {Object.keys(statusFilters).map((status) => (
                                  <label key={status} className='custom-checkbox'>
                                    <input
                                      type='checkbox'
                                      checked={statusFilters[status]}
                                      onChange={() => handleCheckboxChange(status)}
                                    />
                                    {status}
                                  </label>
                                ))}
                              </div>

                              <div className='flex flex-col gap-2 py-2'>
                                <label className={`text-xs font-semibold ${darkMode ? 'text-dark-border' : 'dark:text-light-border'}`}>PAYMENT METHOD</label>
                                <select
                                    id='paymentMethod'
                                    value={paymentMethod}
                                    onChange={handlePaymentMethodChange}
                                    className={`border rounded p-2 my-1 
                                      ${paymentMethod === '' 
                                        ? (darkMode ? 'bg-transparent text-black border-black' : 'bg-transparent') 
                                        : (darkMode 
                                          ? 'bg-light-activeLink text-light-primary' 
                                          : 'bg-transparent text-black')} 
                                      outline-none font-semibold`}
                                  >
                                    <option value=''>Select Option</option>
                                    <option value='Cash'>Cash</option>
                                    <option value='GCash'>GCash</option>
                                    <option value='GGvices'>GGvices</option>
                                    <option value='Bank Transfer'>Bank Transfer</option>
                                    <option value='BDO Credit Card'>BDO Credit Card</option>
                                    <option value='Credit Card - Online'>Credit Card - Online</option>
                                  </select>
                              </div>

                            </div>






                      <div className='flex flex-col'>
                        <label className={`text-xs mb-2 font-semibold ${darkMode ? 'text-dark-border' : 'dark:text-light-border'}`}>AMOUNT RANGE</label>

                        <div className='flex justify-center items-center'>
                          <div className='flex flex-col'>
                            <div className={`w-[130px] border rounded bg-transparent border-3 pl-1 ${darkMode ? 'border-light-container1' : 'dark:border-dark-container1'}`}>
                              <input
                                type='number'
                                id='minPrice'
                                value={minPrice}
                                onChange={handleMinPriceChange}
                                className='border-none px-2 py-1 text-sm bg-transparent w-[100%] outline-none'
                                min='0'
                                placeholder='Min'
                              />
                            </div>
                          </div>

                          <span className='text-2xl text-center h-full w-full text-[#a8adb0] mx-2'>-</span>

                          <div className='flex flex-col'>
                            <div className={`w-[130px] border rounded bg-transparent border-3 pl-1 ${darkMode ? 'border-light-container1' : 'dark:border-dark-container1'}`}>
                              <input
                                type='number'
                                id='maxPrice'
                                value={maxPrice}
                                onChange={handleMaxPriceChange}
                                className='border-none px-2 py-1 text-sm bg-transparent w-[100%] outline-none'
                                min='0'
                                placeholder='Max'
                              />
                            </div>
                          </div>
                        </div>
                      </div>


                      <div className='flex flex-col'>
                                  <label className={`text-xs mb-2 font-semibold ${darkMode ? 'text-dark-border' : 'dark:text-light-border'}`}>SALES DATE</label>

                                <div className='flex justify-center items-center'>
                                  <div className='flex flex-col'>
                                    <div className={`w-[130px] border rounded bg-transparent border-3 pl-1 ${darkMode ? 'border-light-container1' : 'dark:border-dark-container1'}`}>
                                      <DatePicker
                                        selected={startDate}
                                        onChange={handleStartDateChange}
                                        dateFormat='MM-dd-yyyy'
                                        className='p-1 bg-transparent w-[100%] outline-none'
                                        placeholderText='MM-DD-YYYY'
                                      />
                                    </div>
                                  </div>

                                  <span className='text-2xl text-center h-full w-full text-[#a8adb0] mx-2'>-</span>

                                  <div className='flex flex-col'>
                                    <div className={`w-[130px] border rounded bg-transparent border-3 pl-1 ${darkMode ? 'border-light-container1' : 'dark:border-dark-container1'}`}>
                                      <DatePicker
                                        selected={endDate}
                                        onChange={handleEndDateChange}
                                        dateFormat='MM-dd-yyyy'
                                        className='bg-transparent w-[100%] p-1 outline-none'
                                        placeholderText='MM-DD-YYYY'
                                        minDate={startDate}
                                      />
                                    </div>
                                  </div>
                                </div>
                            </div>
                    </div>

                    <div className='flex flex-col gap-2 pt-8'>
                    <button
                      className={`text-white py-2 px-4 rounded w-full h-[50px] flex items-center justify-center tracking-wide font-medium bg-transparent border-2 
                        ${darkMode ? 'hover:bg-opacity-30 hover:bg-dark-textSecondary' : 'hover:bg-opacity-30 hover:bg-light-textSecondary'}`}
                            onClick={handleResetFilters}
                      >
                        <HiOutlineRefresh className={`mr-2 text-2xl ${darkMode ? 'text-dark-textSecondary' : 'text-dark-textSecondary' }`} />
                        <p className={`text-lg ${darkMode ? 'text-dark-textSecondary' : 'text-dark-textSecondary' }`}>Reset Filters</p>
                      </button>
                    </div>
               </div>
      
          {loading ? (
                <Spinner />
              ) : salesOrder.length === 0 ? (
                <div className='w-[80%] h-[77vh] flex items-center justify-center'>
                  <p className={`${darkMode ? 'text-light-textPrimary' : 'dark:text-dark-textPrimary'}`}>No Successful Transactions</p>
                </div>
              ) : (
                <div className='w-[80%] h-[77vh]'>
                  <div className="overflow-x-auto max-h-screen h-[78vh] rounded-2xl">
                    <table className={`w-full table-auto ${darkMode ? 'bg-light-container' : 'dark:bg-dark-container'}`}>
                      <thead className="sticky top-0 z-5">
                        <tr className={`border-b-2 ${darkMode ? 'border-light-primary' : 'dark:border-dark-primary'}`}>
                          <th className={`text-left p-4 text-sm ${darkMode ? 'text-light-textPrimary' : 'dark:text-dark-textPrimary'} text-center bg-light-container`}>Transaction ID</th>
                          <th className={`text-left p-4 text-sm ${darkMode ? 'text-light-textPrimary' : 'dark:text-dark-textPrimary'} text-center bg-light-container`}>Sales Date</th>
                          <th className={`text-left p-4 text-sm ${darkMode ? 'text-light-textPrimary' : 'dark:text-dark-textPrimary'} text-center bg-light-container`}>Customer Name</th>
                          <th className={`text-left p-4 text-sm ${darkMode ? 'text-light-textPrimary' : 'dark:text-dark-textPrimary'} text-center bg-light-container`}>Product Name</th>
                          <th className={`text-left p-4 text-sm ${darkMode ? 'text-light-textPrimary' : 'dark:text-dark-textPrimary'} text-center bg-light-container`}>Qty. Sold</th>
                          <th className={`text-left p-4 text-sm ${darkMode ? 'text-light-textPrimary' : 'dark:text-dark-textPrimary'} text-center bg-light-container`}> Total Amount</th>
                          <th className={`text-left p-4 text-sm ${darkMode ? 'text-light-textPrimary' : 'dark:text-dark-textPrimary'} text-center bg-light-container`}> Status</th>
                          <th className={`text-left p-4 text-sm ${darkMode ? 'text-light-textPrimary' : 'dark:text-dark-textPrimary'} text-center bg-light-container`}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesOrder.flatMap((transaction) =>
                          transaction.products.map((item, idx) => (
                            <tr key={`${transaction._id}-${idx}`} className={`border-b ${darkMode ? 'border-light-primary' : 'dark:border-dark-primary'}`}>
                              <td className={`p-4 text-xs ${darkMode ? 'text-light-textPrimary' : 'dark:text-dark-textPrimary'} text-center`}>
                                {transaction.transaction_id || 'N/A'}
                              </td>
                              <td className={`py-4 text-xs ${darkMode ? 'text-light-textPrimary' : 'dark:text-dark-textPrimary'} text-center`}>
                                {formatDate(transaction.transaction_date)}
                              </td>
                              <td className={`p-4 text-xs ${darkMode ? 'text-light-textPrimary' : 'dark:text-dark-textPrimary'} text-center`}>
                                {transaction.customer?.name || 'None'}
                              </td>
                              <td className={`p-4 text-xs ${darkMode ? 'text-light-textPrimary' : 'dark:text-dark-textPrimary'} text-center`}>
                                {item.product?.name || 'Unknown Product'}
                              </td>
                              <td className={`p-4 text-xs ${darkMode ? 'text-light-textPrimary' : 'dark:text-dark-textPrimary'} text-center`}>
                                {item.quantity || 'N/A'}
                              </td>
                              <td className={`p-4 text-xs ${darkMode ? 'text-light-textPrimary' : 'dark:text-dark-textPrimary'} text-center`}>
                                {transaction.total_price || 'N/A'}
                              </td>
                              <td className={`p-4 text-sm font-semibold ${getStatusStyles(transaction.status).textClass} text-center`}>
                                <span className={`px-4 py-2 rounded ${getStatusStyles(transaction.status).bgClass}`}>
                                  {transaction.status || 'N/A'}
                                </span>
                              </td>
                              <td className={`p-4 h-full flex items-center justify-center text-sm ${darkMode ? 'text-light-textPrimary' : 'dark:text-dark-textPrimary'} text-center`}>
                                <button className={`text-white px-4 py-2 rounded-md ${darkMode ? 'bg-light-button' : 'bg-light-button'}`}
                                  onClick={() => handleViewTransaction(transaction, item)}>
                                  View
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>

              )}
          </div>
        </div>
        {/* Transaction Detail Modal */}
        {showViewPanel && (
            <ViewTransaction transaction={selectedTransaction} 
                onClose={closeAllPanels} 
            />
        )}



      </div>
    );
}

export default DashboardTransaction;
