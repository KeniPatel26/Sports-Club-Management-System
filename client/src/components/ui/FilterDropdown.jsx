import React from 'react';
import Select from './Select';

/** Compact filter control that reuses the application's standard Select styling. */
export const FilterDropdown = ({ label, value, onChange, options, className = '', ...props }) => (
  <div className={`filter-dropdown-control ${className}`.trim()}>
    {label && <label className="form-label">{label}</label>}
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder={null}
      aria-label={label || 'Filter results'}
      {...props}
    />
  </div>
);

export default FilterDropdown;
