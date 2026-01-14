import { getInterests } from "../api/interests";
import { useState, useEffect, useId } from "react";

type DropdownProps = {
  selectedInterests: string[];
  onChange: (newSelected: string[]) => void;
};

export default function Dropdown({ selectedInterests, onChange }: DropdownProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const dropdownId = useId();
  const listId = `${dropdownId}-list`;

  const toggleInterest = (interest: string) => {
    const updated = selectedInterests.includes(interest)
      ? selectedInterests.filter((i) => i !== interest)
      : [...selectedInterests, interest];
    onChange(updated);
  };

  useEffect(() => {
    getInterests().then(setInterests);
  }, []);

  return (
    <div className="dropdown w-full" style={{ position: "relative" }}>
      <button
        className="btn btn-secondary dropdown-toggle w-full"
        id={dropdownId}
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
        aria-haspopup="listbox"
        aria-controls={listId}
        style={{ zIndex: 10000 }}
      >
        {selectedInterests.length > 0
          ? `Valda (${selectedInterests.length})`
          : "Välj intressen"}
      </button>
      <ul
        className={`dropdown-menu${dropdownOpen ? " show" : ""}`}
        id={listId}
        aria-labelledby={dropdownId}
        style={{ maxHeight: "200px", overflowY: "auto" }}
      >
        {interests.map((interest) => (
          <li key={interest} className="dropdown-item">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id={`interest-${interest}`}
                checked={selectedInterests.includes(interest)}
                onChange={() => toggleInterest(interest)}
              />
              <label className="form-check-label" htmlFor={`interest-${interest}`}>
                {interest}
              </label>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
