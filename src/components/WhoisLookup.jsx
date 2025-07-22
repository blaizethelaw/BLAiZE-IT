import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/500.css';

export default function WhoisLookup() {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Lookup for ${query} would be performed here.`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-4 py-8"
    >
      <TextField
        label="Enter a domain or IP address..."
        variant="outlined"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{
          width: '100%',
          maxWidth: 400,
          input: { color: '#fff', fontFamily: 'Outfit' },
          label: { color: 'rgba(255,255,255,0.7)', fontFamily: 'Outfit' },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.5)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.87)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4D9900',
          },
        }}
      />
      <Button
        type="submit"
        variant="contained"
        sx={{
          fontFamily: 'Outfit',
          backgroundColor: '#4D9900',
          '&:hover': { backgroundColor: '#3c7a00' },
        }}
      >
        Search
      </Button>
    </form>
  );
}
