import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // so dropdown items can navigate

export default function DropDownMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  // You can put routes or external links here
  const menuItems = [
    { label: 'Option 1', path: '/third' },
    { label: 'Option 2', path: '/second' },
    { label: 'Option 3', path: '/chat' },
    { label: 'Option 4', path: '/chart/bitcoin' },
  ];

  return (
    <div className="dropdown-container">
      <button onClick={toggleDropdown} className="dropdown-button">
        More ▼
      </button>
      {isOpen && (
        <ul className="dropdown-menu">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link to={item.path} onClick={() => setIsOpen(false)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
