import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Stack,
} from "@mui/material";

const exampleTemplates = [
  {
    name: "Light Bill",
    formula: "((current_reading - previous_reading) * rate) * (1 + vat)",
    variables: {
      current_reading: 1200,
      previous_reading: 1000,
      rate: 63.88,
      vat: 0.075,
    },
  },
  {
    name: "Area of Circle",
    formula: "3.1416 * radius * radius",
    variables: { radius: 5 },
  },
  {
    name: "Salary Deduction",
    formula: "gross - (gross * tax_rate) - pension",
    variables: { gross: 200000, tax_rate: 0.15, pension: 12000 },
  },
];

const extractVariables = (formula) => {
  const matches = formula.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g);
  // filter out any JS keywords or numbers
  const blacklist = ["if", "else", "for", "while", "return"];
  const variables = [
    ...new Set(
      matches?.filter((w) => isNaN(w) && !blacklist.includes(w)) || []
    ),
  ];
  return variables;
};

const BillCalculator = () => {
  const [formula, setFormula] = useState("");
  const [variables, setVariables] = useState({});
  const [result, setResult] = useState(null);

  const resultRef = useRef(null);

  const handleChange = (key, value) => {
    setVariables({ ...variables, [key]: value });
  };

  const handleCalculate = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formula, variables }),
    });
    const data = await res.json();
    setResult(data.result ?? data.error);

     // Wait a tiny bit to allow the result to render
  setTimeout(() => {
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
  };

  const handleClear = () => {
    setFormula("");
    setVariables({});
    setResult(null);
  };

  useEffect(() => {
    const keys = extractVariables(formula);
    const updatedVars = {};
    keys.forEach((key) => {
      updatedVars[key] = variables[key] ?? "";
    });
    setVariables(updatedVars);
  }, [formula]);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        🧮 Formula Calculator
      </Typography>

      <Box mb={2} p={2} bgcolor="#f5f5f5" borderRadius={2}>
        <Typography variant="subtitle1">
          <strong>🧠 Formula Tips</strong>
        </Typography>
        <ul style={{ paddingLeft: "1rem" }}>
          <li>Use +, -, *, / for math</li>
          <li>Use parentheses ( ) to group operations</li>
          <li>Add VAT with amount * (1 + vat)</li>
        </ul>
      </Box>

      <Box mb={3}>
        <Typography variant="subtitle1">
          <strong>📚 Formula Examples</strong>
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {exampleTemplates.map((example, index) => (
            <Button
              key={index}
              variant="outlined"
              onClick={() => {
                setFormula(example.formula);
                setVariables(example.variables);
                setResult(null);
              }}
            >
              {example.name}
            </Button>
          ))}
          <Button variant="text" color="error" onClick={handleClear}>
            Clear
          </Button>
        </Stack>
      </Box>

      <TextField
        fullWidth
        label="Enter your formula"
        value={formula}
        onChange={(e) => setFormula(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Typography variant="subtitle2" color="textSecondary">
        📌 Formula Preview:
      </Typography>
      <Typography variant="body1" sx={{ wordBreak: "break-word", mb: 2 }}>
        {formula || "Your formula will appear here..."}
      </Typography>

      {Object.keys(variables).map((key) => (
        <TextField
          key={key}
          label={key}
          value={variables[key]}
          onChange={(e) => handleChange(key, parseFloat(e.target.value))}
          fullWidth
          sx={{ mb: 2 }}
          type="number"
        />
      ))}

      <Button variant="contained" onClick={handleCalculate}>
        Calculate
      </Button>

      {result !== null && (
        <Box mt={3} ref={resultRef}>
          <Typography variant="h6" gutterBottom>
            🎉 Your Result
          </Typography>
          <Box
            p={2}
            bgcolor="#e3f2fd"
            border="1px solid #90caf9"
            borderRadius={2}
            fontSize="1.25rem"
            fontWeight="bold"
            textAlign="center"
          >
            {result}
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default BillCalculator;
