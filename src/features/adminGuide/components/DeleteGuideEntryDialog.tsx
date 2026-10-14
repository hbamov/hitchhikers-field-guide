import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { GuideEntry } from "../../guide/types/guide.types";
import { useDeleteGuideEntry } from "../hooks/useDeleteGuideEntry";

interface DeleteGuideEntryDialogProps {
  open: boolean;
  onClose: () => void;
  entry: GuideEntry | null;
}

export function DeleteGuideEntryDialog({
  open,
  onClose,
  entry,
}: DeleteGuideEntryDialogProps) {
  const mutation = useDeleteGuideEntry();
  const [error, setError] = useState<string | null>(null);

  if (!entry) return null;

  const entryId = entry.id;

  async function handleDelete() {
    try {
      setError(null);
      await mutation.mutateAsync(entryId);
      onClose();
    } catch {
      setError("Couldn’t delete Guide entry. Please try again.");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={mutation.isPending ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Delete Guide entry?</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">
          “{entry.name}” will be permanently removed.
        </Typography>
        {error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={handleDelete}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
