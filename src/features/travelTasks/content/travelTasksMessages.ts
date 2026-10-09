export const travelTasksMessages = {
  overline: "Expedition checklist",
  title: "Travel Tasks",
  description: "Track what you need before your next jump through the galaxy.",

  loading: "Loading checklist items…",

  error: {
    generic: "We couldn’t load your checklist right now. Please try again.",
    retry: "Try again",
  },

  empty: {
    title: "Your checklist is empty",
    description: "Add your first item to start planning the journey.",
  },

  status: {
    open: "Open",
    completed: "Completed",
  },

  labels: {
    priority: "Priority",
    due: "Due",
  },
} as const;
