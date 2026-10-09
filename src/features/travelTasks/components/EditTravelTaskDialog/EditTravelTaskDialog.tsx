import { Alert, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useState } from "react";
import { TravelTaskForm } from "../TravelTaskForm/TravelTaskForm";
import { useUpdateTravelTask } from "../../hooks/useUpdateTravelTask";
import type {
  CreateTravelTaskInput,
  TravelTask,
} from "../../types/travelTask.types";

interface EditTravelTaskDialogProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
  task: TravelTask | null;
}

export function EditTravelTaskDialog({
  open,
  onClose,
  userId,
  task,
}: EditTravelTaskDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const updateMutation = useUpdateTravelTask(userId);

  if (!task) return null;

  const currentTask = task;

  async function handleSubmit(input: CreateTravelTaskInput) {
    try {
      setSubmitError(null);
      await updateMutation.mutateAsync({
        taskId: currentTask.id,
        input: {
          title: input.title,
          description: input.description ?? "",
          priority: input.priority,
          dueDate: input.dueDate ?? null,
        },
      });
      onClose();
    } catch {
      setSubmitError("Couldn’t save changes. Please try again.");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={updateMutation.isPending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Edit checklist item</DialogTitle>
      <DialogContent>
        {submitError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        ) : null}

        <TravelTaskForm
          mode="edit"
          initialTask={task}
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitting={updateMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
