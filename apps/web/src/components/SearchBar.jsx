import { useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SearchBar({ onSearch }) {
  const [value, setValue] = useState("");

  const handleChange = useCallback(
    (e) => {
      const v = e.target.value;
      setValue(v);
      onSearch(v);
    },
    [onSearch],
  );

  const clear = useCallback(() => {
    setValue("");
    onSearch("");
  }, [onSearch]);

  return (
    <div className="search-bar">
      <Search size={18} className="search-icon" />
      <Input
        placeholder="Search songs, artists, albums..."
        value={value}
        onChange={handleChange}
        className="search-input"
      />
      {value && (
        <Button variant="ghost" size="icon" onClick={clear} className="search-clear">
          <X size={16} />
        </Button>
      )}
    </div>
  );
}
