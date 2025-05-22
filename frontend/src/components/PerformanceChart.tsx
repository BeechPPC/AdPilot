import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { date: '2024-01', spend: 4000, conversions: 240 },
  { date: '2024-02', spend: 3000, conversions: 139 },
  { date: '2024-03', spend: 2000, conversions: 980 },
  { date: '2024-04', spend: 2780, conversions: 390 },
  { date: '2024-05', spend: 1890, conversions: 480 },
  { date: '2024-06', spend: 2390, conversions: 380 },
];

const PerformanceChart: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Performance Overview
      </Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="spend"
              stroke="#8884d8"
              name="Spend"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="conversions"
              stroke="#82ca9d"
              name="Conversions"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default PerformanceChart; 