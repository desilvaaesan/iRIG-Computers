import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useAuthContext } from '../hooks/useAuthContext';
import { useAdminTheme } from '../context/AdminThemeContext'; // Import the theme context
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'; 
import axios from 'axios';
import { API_DOMAIN } from '../utils/constants';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const LineChart = ({ selectedTimeframe, customStart, customEnd }) => {
  const [salesData, setSalesData] = useState([]);
  const { user } = useAuthContext();
  const { darkMode } = useAdminTheme(); 

  const fetchSalesOrders = async () => {
    try {
      let endDate = new Date();
      let startDate = new Date();
  
      // Adjust date range based on selected timeframe or custom dates
      switch (selectedTimeframe) {
        case 'Last 7 Days':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'Last 30 Days':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case 'Last 3 Months':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'Last 6 Months':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case 'This Year':
          startDate.setMonth(0, 1);
          break;
        case 'Custom Range':
          if (customStart && customEnd) {
            startDate = new Date(customStart);
            endDate = new Date(customEnd);
          }
          break;
        default:
          break;
      }
  
      const response = await axios.get(`${API_DOMAIN}/transaction`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
  
      const transactions = response.data.data;
  
      // Filter for Completed, RMA, and Replaced transactions
      const validTransactions = transactions.filter(transaction => 
        ['Completed', 'RMA', 'Replaced'].includes(transaction.status) &&
        transaction.payment_status === 'paid'
      );
  
      let totalSales = 0; // Total sales from valid transactions
  
      // Calculate total sales from valid transactions
      validTransactions.forEach(transaction => {
        totalSales += transaction.total_price; // Add total price to totalSales
      });
  
      // Now check for refunded transactions that have sold products
      const refundedTransactions = transactions.filter(transaction => transaction.status === 'Refunded');
  
      refundedTransactions.forEach(transaction => {
        if (transaction.products) { // Ensure transaction.products exists
          transaction.products.forEach(product => {
            if (product.units) { // Ensure product.units exists
              const soldUnits = product.units.filter(unit => unit.status === 'sold');
  
              if (soldUnits.length > 0) {
                const additionalSales = product.selling_price * 0.12; 
                totalSales += additionalSales; // Add to total sales
              }
            }
          });
        }
      });
  
  
      // Group data for the chart
      const groupedData = validTransactions.reduce((acc, transaction) => {
        const date = new Date(transaction.createdAt).toISOString().split('T')[0]; 
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += transaction.total_price; // Group total price for each date
        return acc;
      }, {});
  
      // Prepare sales data for the chart, including sales from refunded transactions
      if (['Last 3 Months', 'Last 6 Months', 'This Year'].includes(selectedTimeframe)) {
        const monthlyData = {};
        const monthKey = (date) => new Date(date).toLocaleString('default', { month: 'short' });
  
        Object.entries(groupedData).forEach(([date, value]) => {
          const month = monthKey(date);
          if (!monthlyData[month]) {
            monthlyData[month] = 0;
          }
          monthlyData[month] += value; // Group by month
        });
  
        setSalesData(Object.entries(monthlyData).map(([date, value]) => ({ date, value })));
      } else {
        const formattedData = Object.entries(groupedData).map(([date, value]) => ({
          date,
          value, // Total sales for that date
        }));
        setSalesData(formattedData);
      }
  
    } catch (error) {
      console.error('Error fetching sales orders:', error);
    }
  };
  

  useEffect(() => {
    fetchSalesOrders();
  }, [selectedTimeframe, customStart, customEnd]); // Add customStart and customEnd as dependencies
  

  // Chart data
  const lineChartData = {
    labels: salesData.map(item => item.date),
    datasets: [
      {
        label: 'Sales Data',
        data: salesData.map(item => item.value),
        borderColor: '#E84C19', // Change color based on dark mode
        backgroundColor: 'rgba(232, 76, 25, 0.1)',
        fill: true,
        tension: 0,
        pointRadius: 5,
        pointBackgroundColor:  '#E84C19', // Point color for dark mode
        pointBorderColor: '#fff',
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend
      },
      tooltip: {
        enabled: true,
        backgroundColor: darkMode ? '#fff' : '#333'  , // Tooltip background in dark mode
        titleColor: darkMode ? '#000' : '#fff', // Tooltip title color
        bodyColor: darkMode ? '#000' : '#fff', // Tooltip body text color
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: darkMode ? '#000' : '#fff', // Axis label color in dark mode
        },
        grid: {
          color: darkMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)' , // Grid lines color for dark mode
        },
      },
      y: {
        ticks: {
          color: darkMode ? '#000' : '#fff',
          callback: (value) => `₱ ${value / 1000}K`, // Format as currency
        },
        grid: {
          color: darkMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)' , // Grid lines color for dark mode
        },
        beginAtZero: true,
        min: 0,
        max: 400000,
      },
    },
  };

  return <Line data={lineChartData} options={chartOptions} />;
};

export default LineChart;

