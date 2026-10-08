export const dashboardMessages = {
  advisory:
    "Galactic advisory: check local customs before offering anyone a cup of tea.",
  briefing: "Traveler’s briefing",

  welcome: (name: string) => `Good to have you, ${name}.`,

  description: "Your guide is ready. Your destination may or may not be.",

  featuredDestination: "Featured guide entry",

  checklist: {
    title: "Travel checklist",
    empty: "No tasks yet",
    description:
      "When task management arrives, this is where your packing list will appear.",
  },

  accountSummary: (email: string, role: string) =>
    `You are signed in as ${email} · role: ${role}`,

  defaultDisplayName: "Traveler",
} as const;
