import React, { useState } from 'react';
import {
  Button, Popover, Box, List, ListItemButton, ListItemText,
  Divider, Typography, Switch, FormControlLabel, Stack,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import dayjs, { Dayjs } from 'dayjs';
import { useGoogleAds } from '../context/GoogleAdsContext';
import { DATE_RANGE_OPTIONS } from '../utils/friendlyNames';

const PRESETS = DATE_RANGE_OPTIONS.filter((o) => o.value !== 'CUSTOM');

const DateRangePicker: React.FC = () => {
  const {
    dateRange, setDateRange,
    customStartDate, customEndDate, setCustomStartDate, setCustomEndDate,
    compareEnabled, setCompareEnabled,
  } = useGoogleAds();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [tempStart, setTempStart] = useState<Dayjs | null>(
    customStartDate ? dayjs(customStartDate) : null,
  );
  const [tempEnd, setTempEnd] = useState<Dayjs | null>(
    customEndDate ? dayjs(customEndDate) : null,
  );

  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    // Reset temp dates to current custom values
    setTempStart(customStartDate ? dayjs(customStartDate) : null);
    setTempEnd(customEndDate ? dayjs(customEndDate) : null);
  };

  const handleClose = () => setAnchorEl(null);

  const handlePresetClick = (value: string) => {
    setDateRange(value);
    setCustomStartDate(null);
    setCustomEndDate(null);
    handleClose();
  };

  const handleApplyCustom = () => {
    if (tempStart && tempEnd) {
      setCustomStartDate(tempStart.format('YYYY-MM-DD'));
      setCustomEndDate(tempEnd.format('YYYY-MM-DD'));
      setDateRange('CUSTOM');
      handleClose();
    }
  };

  // Build the button label
  let label: string;
  if (dateRange === 'CUSTOM' && customStartDate && customEndDate) {
    const s = dayjs(customStartDate);
    const e = dayjs(customEndDate);
    label = `${s.format('MMM D')} – ${e.format('MMM D, YYYY')}`;
  } else {
    label = PRESETS.find((p) => p.value === dateRange)?.label ?? 'Last 30 days';
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Button
        variant="outlined"
        size="small"
        startIcon={<CalendarTodayIcon />}
        onClick={handleOpen}
        sx={{
          textTransform: 'none',
          height: 36,
          backgroundColor: 'background.default',
          borderColor: 'divider',
          color: 'text.primary',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Button>

      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={compareEnabled}
            onChange={(_, checked) => setCompareEnabled(checked)}
          />
        }
        label={<Typography variant="caption" noWrap>Compare</Typography>}
        sx={{ ml: 0, mr: 0 }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { width: 320, mt: 1 } } }}
      >
        <List dense disablePadding>
          {PRESETS.map((opt) => (
            <ListItemButton
              key={opt.value}
              selected={dateRange === opt.value}
              onClick={() => handlePresetClick(opt.value)}
            >
              <ListItemText primary={opt.label} />
            </ListItemButton>
          ))}
        </List>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            Custom range
          </Typography>
          <Stack spacing={2}>
            <DatePicker
              label="Start date"
              value={tempStart}
              onChange={(v) => setTempStart(v)}
              maxDate={tempEnd ?? dayjs()}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
            <DatePicker
              label="End date"
              value={tempEnd}
              onChange={(v) => setTempEnd(v)}
              minDate={tempStart ?? undefined}
              maxDate={dayjs()}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
            <Button
              variant="contained"
              size="small"
              disabled={!tempStart || !tempEnd}
              onClick={handleApplyCustom}
            >
              Apply
            </Button>
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
};

export default DateRangePicker;
