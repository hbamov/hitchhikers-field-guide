import { Alert, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useState } from "react";
import { TravelTaskForm } from "../TravelTaskForm/TravelTaskForm";
import { useCreateTravelTask } from "../../hooks/useCreateTravelTask";
import type { CreateTravelTaskInput } from "../../types/travelTask.types";

interface CreateTravelTaskDialogProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
}

export function CreateTravelTaskDialog({
  open,
  onClose,
  userId,
}: CreateTravelTaskDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createTaskMutation = useCreateTravelTask(userId);

  async function handleCreate(input: CreateTravelTaskInput) {
    try {
      setSubmitError(null);
      await createTaskMutation.mutateAsync(input);
      onClose();
    } catch {
      setSubmitError("Couldn’t create checklist item. Please try again.");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={createTaskMutation.isPending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Add checklist item</DialogTitle>
      <DialogContent>
        {submitError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        ) : null}

        <TravelTaskForm
          mode="create"
          onSubmit={handleCreate}
          onCancel={onClose}
          submitting={createTaskMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
