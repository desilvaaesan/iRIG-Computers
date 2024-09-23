import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { useAdminTheme } from '../context/AdminThemeContext';

const AdminSearchBar = ({ query, onQueryChange, placeholderMessage }) => {
  const { darkMode } = useAdminTheme(); // Access darkMode from context

  const handleChange = (event) => {
    onQueryChange(event.target.value); // Call the function to update query in parent
  };

  const handleClear = () => {
    onQueryChange(''); // Clear the query in parent
  };

  return (
    <div className={`w-[480px] flex items-center px-4 rounded-md border ${darkMode ? 'bg-light-container text-light-textPrimary boder-border' : 'dark:bg-dark-container dark:text-dark-textPrimary boder-border'}`}>
      <input 
        type="text"
        placeholder={placeholderMessage}
        className='w-full text-xs bg-transparent py-[11px] outline-none'
        value={query}
        onChange={handleChange}       
      />
      {query ? (
        <IoMdClose className={`${darkMode ? 'text-light-primary' : 'text-dark-primary'} hover:text-white cursor-pointer`} onClick={handleClear} />
      ) : (
        <FaSearch className={`${darkMode ? 'text-light-primary' : 'text-dark-primary'} hover:text-white cursor-pointer`} />
      )}
    </div>
  );
};

export default AdminSearchBar;
