"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";


const BRAND_RED = "#A40301";

interface CustomerInfoDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;

  name: string;
  setName: (value: string) => void;

  phone: string;
  setPhone: (value: string) => void;

  isSubmitting?: boolean;
}

export default function CustomerInfoDialog({
  open,
  onClose,
  onSave,
  name,
  setName,
  phone,
  setPhone,
  isSubmitting = false,
}: CustomerInfoDialogProps) {
  const canSave =
    name.trim().length >= 2 &&
    /^[689]\d{7}$/.test(phone);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {/* Header */}
      <DialogTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
      <PersonIcon sx={{ color: BRAND_RED }} />
          Complete Your Profile
        </div>

        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent dividers>
        <p className="mb-5 text-sm text-gray-600">
          Before proceeding to payment, please provide your name and phone
          number.
        </p>

        <div className="space-y-4">
          <TextField
            fullWidth
            size="small"
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextField
            fullWidth
            size="small"
            label="Phone Number"
            value={phone}
            onChange={(e) =>
              setPhone(
                e.target.value.replace(/\D/g, "").slice(0, 8)
              )
            }
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    +65
                  </InputAdornment>
                ),
              },
            }}
          />
        </div>
      </DialogContent>

      {/* Footer */}
      <DialogActions className="p-4">
        <Button onClick={onClose} color="inherit">
          Close
        </Button>

        <Button
          variant="contained"
          onClick={onSave}
          disabled={!canSave || isSubmitting}
          sx={{
            backgroundColor: BRAND_RED,
            "&:hover": {
              backgroundColor: "#7f0301",
            },
            "&.Mui-disabled": {
              backgroundColor: "#e0e0e0",
            },
          }}
        >
          {isSubmitting ? "Saving..." : "Save & Continue"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}