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
import { useDeleteTravelTask } from "../../hooks/useDeleteTravelTask";
import type { TravelTask } from "../../types/travelTask.types";

interface DeleteTaskDialogProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
  task: TravelTask | null;
}

export function DeleteTaskDialog({
  open,
  onClose,
  userId,
  task,
}: DeleteTaskDialogProps) {
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteMutation = useDeleteTravelTask(userId);

  if (!task) return null;

  const currentTask = task;

  async function handleDelete() {
    try {
      setDeleteError(null);
      await deleteMutation.mutateAsync(currentTask.id);
      onClose();
    } catch {
      setDeleteError("Couldn’t delete checklist item. Please try again.");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={deleteMutation.isPending ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Delete checklist item?</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">
          “{currentTask.title}” will be permanently removed from your expedition
          checklist.
        </Typography>
        {deleteError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {deleteError}
          </Alert>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={deleteMutation.isPending}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
