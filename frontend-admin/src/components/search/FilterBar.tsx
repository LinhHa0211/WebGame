'use client';

import React, { useState, useEffect } from 'react';
import apiService from '@/services/apiService';

interface Category {
  id: string;
  title: string;
}

interface OperatingSystem {
  id: string;
  title: string;
}

interface Publisher {
  id: string;
  username: string;
}

interface FilterBarProps {
  categories: Category[];
  operatingSystems: OperatingSystem[];
  publishers: Publisher[];
  selectedCategories: string[];
  setSelectedCategories: (categories: string[] | ((prev: string[]) => string[])) => void;
  selectedOperatingSystems: string[];
  setSelectedOperatingSystems: (systems: string[] | ((prev: string[]) => string[])) => void;
  selectedPublishers: string[];
  setSelectedPublishers: (publishers: string[] | ((prev: string[]) => string[])) => void;
  minPrice: string;
  setMinPrice: (price: string) => void;
  maxPrice: string;
  setMaxPrice: (price: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  operatingSystems,
  publishers,
  selectedCategories,
  setSelectedCategories,
  selectedOperatingSystems,
  setSelectedOperatingSystems,
  selectedPublishers,
  setSelectedPublishers,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
}) => {
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev: string[]) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const handleOperatingSystemChange = (systemId: string) => {
    setSelectedOperatingSystems((prev: string[]) =>
      prev.includes(systemId) ? prev.filter((id) => id !== systemId) : [...prev, systemId]
    );
  };

  const handlePublisherChange = (publisherId: string) => {
    setSelectedPublishers((prev: string[]) =>
      prev.includes(publisherId) ? prev.filter((id) => id !== publisherId) : [...prev, publisherId]
    );
  };

  return (
    <div className="w-64 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Filters</h2>

      {/* Categories Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Categories</h3>
        {categories.length === 0 ? (
          <p className="text-gray-500 text-sm">No categories available</p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">{category.title}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Operating Systems Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Operating Systems</h3>
        {operatingSystems.length === 0 ? (
          <p className="text-gray-500 text-sm">No operating systems available</p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {operatingSystems.map((system) => (
              <label key={system.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedOperatingSystems.includes(system.id)}
                  onChange={() => handleOperatingSystemChange(system.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">{system.title}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Publishers Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Publishers</h3>
        {publishers.length === 0 ? (
          <p className="text-gray-500 text-sm">No publishers available</p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {publishers.map((publisher) => (
              <label key={publisher.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedPublishers.includes(publisher.id)}
                  onChange={() => handlePublisherChange(publisher.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">{publisher.username}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Price Range</h3>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            min="0"
          />
          <span className="text-gray-700">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            min="0"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterBar;