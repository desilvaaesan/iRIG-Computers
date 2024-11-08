import React from 'react';
import { useAdminTheme } from '../../context/AdminThemeContext';

const RmaSummary = ({ filteredRMA = [] }) => {
  const { darkMode } = useAdminTheme();

  // Calculate totals based on the filtered RMA data
  const totalRMA = filteredRMA.length;
  const pendingRMA = filteredRMA.filter(rma => rma.status === 'Pending').length;
  const approvedRMA = filteredRMA.filter(rma => rma.status === 'Approved').length;
  const completedRMA = filteredRMA.filter(rma => rma.status === 'Completed').length;
  const replacedRMA = filteredRMA.filter(rma => rma.process === 'Replacement' && rma.status === 'Completed').length;

  // Adjust totalUnitsReplaced logic to count units marked as "replaced"
  const totalUnitsReplaced = filteredRMA.reduce((total, rma) => {
    if (!rma.product_id) return total;

    return total + filteredRMA.reduce((count, currentRMA) => {
      const productMatches = currentRMA.product_id === rma.product_id;
      const serialMatches = currentRMA.serial_number === rma.serial_number;
      const isReplaced = currentRMA.process === 'Replacement' && currentRMA.status === 'Completed';

      return count + (productMatches && serialMatches && isReplaced ? 1 : 0);
    }, 0);
  }, 0);

  return (
    <div className={`flex flex-col w-full border-b-2 py-2 pb-6 ${darkMode ? 'border-light-textPrimary' : 'border-dark-textPrimary'}`}>
      <p className='text-2xl font-bold py-4'>RMA Summary</p>
      <div className='flex flex-col w-[50%] gap-2'>
        <div className='flex justify-between font-semibold py-2'>
          <p className='border-b w-[60%]'>Total RMA Requests</p>
          <p className='w-[40%] text-start border-b'>{totalRMA}</p>
        </div>
        <div className='flex justify-between font-semibold py-2'>
          <p className='border-b w-[60%]'>Pending RMA Requests</p>
          <p className='w-[40%] text-start border-b'>{pendingRMA}</p>
        </div>
        <div className='flex justify-between font-semibold py-2'>
          <p className='border-b w-[60%]'>Approved RMA Requests</p>
          <p className='w-[40%] text-start border-b'>{approvedRMA}</p>
        </div>
        <div className='flex justify-between font-semibold py-2'>
          <p className='border-b w-[60%]'>Completed RMA Requests</p>
          <p className='w-[40%] text-start border-b'>{completedRMA}</p>
        </div>
        <div className='flex justify-between font-semibold py-2'>
          <p className='border-b w-[60%]'>Total Units Replaced</p>
          <p className='w-[40%] text-start border-b'>{totalUnitsReplaced}</p>
        </div>
      </div>
    </div>
  );
};

export default RmaSummary;
