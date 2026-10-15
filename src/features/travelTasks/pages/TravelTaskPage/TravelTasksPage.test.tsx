import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeAppUser, makeTravelTask } from "../../../../test/factories";
import { renderWithProviders } from "../../../../test/renderWithProviders";
import { useAuth } from "../../../auth/context/AuthContext";
import {
  createTravelTask,
  deleteTravelTask,
  getTravelTasks,
  updateTravelTask,
} from "../../services/travelTasks.service";
import { TravelTasksPage } from "./TravelTasksPage";

vi.mock("../../auth/context/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("../services/travelTasks.service");

const towel = makeTravelTask({
  id: "t1",
  title: "Pack a towel",
  priority: "high",
});
const fish = makeTravelTask({
  id: "t2",
  title: "Buy a Babel fish",
  priority: "low",
});
const done = makeTravelTask({
  id: "t3",
  title: "Learn to fly",
  status: "completed",
  priority: "high",
});

function summaryValue(label: string) {
  return screen.getByText(label).previousElementSibling?.textContent;
}

describe("TravelTasksPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: makeAppUser({ uid: "user-1" }),
    } as ReturnType<typeof useAuth>);
    vi.mocked(getTravelTasks).mockResolvedValue([towel, fish, done]);
    vi.mocked(createTravelTask).mockResolvedValue(undefined as never);
    vi.mocked(updateTravelTask).mockResolvedValue(undefined);
    vi.mocked(deleteTravelTask).mockResolvedValue(undefined);
  });

  it("shows a loading state, then the tasks with correct open, completed and high-priority counts", async () => {
    renderWithProviders(<TravelTasksPage />);
    expect(screen.getByText("Loading checklist items…")).toBeInTheDocument();

    expect(await screen.findByText("Pack a towel")).toBeInTheDocument();
    expect(summaryValue("Open items")).toBe("2");
    expect(summaryValue("Completed items")).toBe("1");
    expect(summaryValue("High-priority open")).toBe("1");
  });

  it("shows the empty state and no summary when there are no tasks", async () => {
    vi.mocked(getTravelTasks).mockResolvedValue([]);
    renderWithProviders(<TravelTasksPage />);

    expect(
      await screen.findByText(/Your checklist is empty/),
    ).toBeInTheDocument();
    expect(screen.queryByText("Open items")).not.toBeInTheDocument();
  });

  it("shows an error and reloads when Try again is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(getTravelTasks).mockRejectedValueOnce(new Error("denied"));
    renderWithProviders(<TravelTasksPage />);

    expect(
      await screen.findByText(/couldn’t load your checklist/),
    ).toBeInTheDocument();
    expect(screen.queryByText("denied")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Pack a towel")).toBeInTheDocument();
  });

  it("filters by status and explains when nothing matches the filter", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TravelTasksPage />);
    await screen.findByText("Pack a towel");

    await user.click(screen.getByRole("button", { name: "Completed" }));
    expect(screen.getByText("Learn to fly")).toBeInTheDocument();
    expect(screen.queryByText("Pack a towel")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Pack a towel")).toBeInTheDocument();
    expect(screen.queryByText("Learn to fly")).not.toBeInTheDocument();
  });

  it("shows a no-match message when the filter has no tasks", async () => {
    const user = userEvent.setup();
    vi.mocked(getTravelTasks).mockResolvedValue([towel]);
    renderWithProviders(<TravelTasksPage />);
    await screen.findByText("Pack a towel");

    await user.click(screen.getByRole("button", { name: "Completed" }));

    expect(screen.getByText("No items match this filter.")).toBeInTheDocument();
  });

  it("marks an open task as completed with a completion date", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TravelTasksPage />);
    await screen.findByText("Pack a towel");

    await user.click(
      screen.getAllByRole("checkbox", { name: "Mark as completed" })[0],
    );

    await waitFor(() => expect(updateTravelTask).toHaveBeenCalled());
    const [taskId, input] = vi.mocked(updateTravelTask).mock.calls[0];
    expect(taskId).toBe("t1");
    expect(input.status).toBe("completed");
    expect(input.completedAt).toBeInstanceOf(Date);
  });

  it("reopens a completed task and clears its completion date", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TravelTasksPage />);
    await screen.findByText("Learn to fly");

    await user.click(screen.getByRole("checkbox", { name: "Mark as open" }));

    await waitFor(() =>
      expect(updateTravelTask).toHaveBeenCalledWith("t3", {
        status: "open",
        completedAt: null,
      }),
    );
  });

  it("does not crash when toggling fails", async () => {
    const user = userEvent.setup();
    vi.mocked(updateTravelTask).mockRejectedValue(new Error("nope"));
    renderWithProviders(<TravelTasksPage />);
    await screen.findByText("Pack a towel");

    await user.click(
      screen.getAllByRole("checkbox", { name: "Mark as completed" })[0],
    );

    await waitFor(() => expect(updateTravelTask).toHaveBeenCalled());
    expect(await screen.findByText("Pack a towel")).toBeInTheDocument();
  });

  it("deletes a task after confirmation", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TravelTasksPage />);
    await screen.findByText("Pack a towel");

    await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    const dialog = await screen.findByRole("dialog", {
      name: "Delete checklist item?",
    });
    expect(within(dialog).getByText(/Pack a towel/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(deleteTravelTask).toHaveBeenCalledWith("t1"));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("keeps the delete dialog open with a generic error when deleting fails", async () => {
    const user = userEvent.setup();
    vi.mocked(deleteTravelTask).mockRejectedValue(
      new Error("permission-denied"),
    );
    renderWithProviders(<TravelTasksPage />);
    await screen.findByText("Pack a towel");

    await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));

    expect(
      await within(dialog).findByText(
        "Couldn’t delete checklist item. Please try again.",
      ),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByText(/permission-denied/),
    ).not.toBeInTheDocument();
  });

  it("cancels deletion without calling the service", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TravelTasksPage />);
    await screen.findByText("Pack a towel");

    await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(deleteTravelTask).not.toHaveBeenCalled();
  });

  it("creates a task with a trimmed title, description, priority and due date", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TravelTasksPage />);
    await screen.findByText("Pack a towel");

    await user.click(
      screen.getByRole("button", { name: "Add checklist item" }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Add checklist item",
    });
    await user.type(
      within(dialog).getByRole("textbox", { name: /Title/ }),
      "  Find tea  ",
    );
    await user.type(
      within(dialog).getByRole("textbox", { name: /Description/ }),
      "Earl Grey",
    );
    await user.click(
      within(dialog).getByRole("combobox", { name: "Priority" }),
    );
    await user.click(await screen.findByRole("option", { name: "High" }));
    await user.type(within(dialog).getByLabelText(/Due date/), "2026-05-04");
    await user.click(
      within(dialog).getByRole("button", { name: /Create item|Save changes/ }),
    );

    await waitFor(() => expect(createTravelTask).toHaveBeenCalled());
    const [uid, input] = vi.mocked(createTravelTask).mock.calls[0];
    expect(uid).toBe("user-1");
    expect(input).toMatchObject({
      title: "Find tea",
      description: "Earl Grey",
      priority: "high",
    });
    expect(input.dueDate).toEqual(new Date(2026, 4, 4));
  });

  it("omits the description and due date when they are left empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TravelTasksPage />);
    await screen.findByText("Pack a towel");

    await user.click(
      screen.getByRole("button", { name: "Add checklist item" }),
    );
    const dialog = await screen.findByRole("dialog");
    await user.type(
      within(dialog).getByRole("textbox", { name: /Title/ }),
      "Find tea",
    );
    await user.click(
      within(dialog).getByRole("button", { name: /Create item|Save changes/ }),
    );

    await waitFor(() => expect(createTravelTask).toHaveBeenCalled());
    expect(vi.mocked(createTravelTask).mock.calls[0][1]).toEqual({
      title: "Find tea",
      description: undefined,
      priority: "medium",
      dueDate: undefined,
    });
  });

  it("requires a title and limits it to 100 characters", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TravelTasksPage />);
    await screen.findByText("Pack a towel");

    await user.click(
      screen.getByRole("button", { name: "Add checklist item" }),
    );
    const dialog = await screen.findByRole("dialog");
    const submit = within(dialog).getByRole("button", {
      name: /Create item|Save changes/,
    });

    await user.click(submit);
    expect(
      await within(dialog).findByText("Title is required."),
    ).toBeInTheDocument();

    await user.type(
      within(dialog).getByRole("textbox", { name: /Title/ }),
      "x".repeat(101),
    );
    await user.click(submit);
    expect(
      await within(dialog).findByText("Title must be 100 characters or fewer."),
    ).toBeInTheDocument();
    expect(createTravelTask).not.toHaveBeenCalled();
  });

  it("shows a generic error and keeps the create dialog open when saving fails", async () => {
    const user = userEvent.setup();
    vi.mocked(createTravelTask).mockRejectedValue(
      new Error("firestore exploded"),
    );
    renderWithProviders(<TravelTasksPage />);
    await screen.findByText("Pack a towel");

    await user.click(
      screen.getByRole("button", { name: "Add checklist item" }),
    );
    const dialog = await screen.findByRole("dialog");
    await user.type(
      within(dialog).getByRole("textbox", { name: /Title/ }),
      "Find tea",
    );
    await user.click(
      within(dialog).getByRole("button", { name: /Create item|Save changes/ }),
    );

    expect(
      await within(dialog).findByText(
        "Couldn’t create checklist item. Please try again.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/firestore exploded/)).not.toBeInTheDocument();
    expect(dialog).toBeInTheDocument();
  });

  it("edits a task, prefilled, sending an empty description and null due date when cleared", async () => {
    const user = userEvent.setup();
    vi.mocked(getTravelTasks).mockResolvedValue([
      makeTravelTask({
        id: "t1",
        title: "Pack a towel",
        description: "Big one",
        priority: "high",
        dueDate: new Date(2026, 4, 4),
      }),
    ]);
    renderWithProviders(<TravelTasksPage />);
    await screen.findByText("Pack a towel");

    await user.click(screen.getByRole("button", { name: "Edit" }));
    const dialog = await screen.findByRole("dialog", {
      name: "Edit checklist item",
    });
    expect(within(dialog).getByRole("textbox", { name: /Title/ })).toHaveValue(
      "Pack a towel",
    );
    expect(
      within(dialog).getByRole("textbox", { name: /Description/ }),
    ).toHaveValue("Big one");
    expect(within(dialog).getByLabelText(/Due date/)).toHaveValue("2026-05-04");

    await user.clear(
      within(dialog).getByRole("textbox", { name: /Description/ }),
    );
    await user.clear(within(dialog).getByLabelText(/Due date/));
    await user.click(
      within(dialog).getByRole("button", { name: "Save changes" }),
    );

    await waitFor(() =>
      expect(updateTravelTask).toHaveBeenCalledWith("t1", {
        title: "Pack a towel",
        description: "",
        priority: "high",
        dueDate: null,
      }),
    );
  });

  it("shows a generic error and keeps the edit dialog open when saving fails", async () => {
    const user = userEvent.setup();
    vi.mocked(updateTravelTask).mockRejectedValue(new Error("boom"));
    renderWithProviders(<TravelTasksPage />);
    await screen.findByText("Pack a towel");

    await user.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Save changes" }),
    );

    expect(
      await within(dialog).findByText(
        "Couldn’t save changes. Please try again.",
      ),
    ).toBeInTheDocument();
  });
});
