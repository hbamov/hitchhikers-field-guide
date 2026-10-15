import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeGuideEntry, makeTravelTask } from "../../../test/factories";
import { createTestQueryClient } from "../../../test/renderWithProviders";
import {
  createTravelTask,
  createTravelTaskFromGuideEntry,
  deleteTravelTask,
  getTravelTasks,
  updateTravelTask,
} from "../services/travelTasks.service";
import { useCreateTravelTask } from "./useCreateTravelTask";
import { useCreateTravelTaskFromGuide } from "./useCreateTravelTaskFromGuide";
import { useDeleteTravelTask } from "./useDeleteTravelTask";
import { useTravelTasks } from "./useTravelTasks";
import { useUpdateTravelTask } from "./useUpdateTravelTask";

vi.mock("../services/travelTasks.service");

function setup() {
  const queryClient = createTestQueryClient();
  const invalidate = vi.spyOn(queryClient, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, invalidate, wrapper };
}

describe("travel task hooks", () => {
  beforeEach(() => vi.resetAllMocks());

  describe("useTravelTasks", () => {
    it("loads the user's tasks", async () => {
      const { wrapper } = setup();
      const tasks = [makeTravelTask()];
      vi.mocked(getTravelTasks).mockResolvedValue(tasks);

      const { result } = renderHook(() => useTravelTasks("u1"), { wrapper });

      await waitFor(() => expect(result.current.data).toEqual(tasks));
      expect(getTravelTasks).toHaveBeenCalledWith("u1");
    });

    it("does not fetch while there is no user", () => {
      const { wrapper } = setup();

      renderHook(() => useTravelTasks(undefined), { wrapper });

      expect(getTravelTasks).not.toHaveBeenCalled();
    });
  });

  describe("useCreateTravelTaskFromGuide", () => {
    it("creates the task and invalidates the user's task list", async () => {
      const { invalidate, wrapper } = setup();
      const entry = makeGuideEntry();
      const { result } = renderHook(() => useCreateTravelTaskFromGuide("u1"), { wrapper });

      await act(() => result.current.mutateAsync(entry));

      expect(createTravelTaskFromGuideEntry).toHaveBeenCalledWith("u1", entry);
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ["travelTasks", "u1"] });
    });

    it("throws when nobody is signed in and writes nothing", async () => {
      const { wrapper } = setup();
      const { result } = renderHook(() => useCreateTravelTaskFromGuide(undefined), { wrapper });

      await expect(result.current.mutateAsync(makeGuideEntry())).rejects.toThrow(
        "You must be signed in to add checklist items.",
      );
      expect(createTravelTaskFromGuideEntry).not.toHaveBeenCalled();
    });
  });

  describe("useCreateTravelTask", () => {
    it("creates the task and invalidates the user's task list", async () => {
      const { invalidate, wrapper } = setup();
      const input = { title: "Pack", priority: "low" as const };
      const { result } = renderHook(() => useCreateTravelTask("u1"), { wrapper });

      await act(() => result.current.mutateAsync(input));

      expect(createTravelTask).toHaveBeenCalledWith("u1", input);
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ["travelTasks", "u1"] });
    });

    it("throws when nobody is signed in", async () => {
      const { wrapper } = setup();
      const { result } = renderHook(() => useCreateTravelTask(undefined), { wrapper });

      await expect(
        result.current.mutateAsync({ title: "Pack", priority: "low" }),
      ).rejects.toThrow("You must be signed in to create a task.");
      expect(createTravelTask).not.toHaveBeenCalled();
    });
  });

  describe("useDeleteTravelTask", () => {
    it("deletes the task and invalidates the user's task list", async () => {
      const { invalidate, wrapper } = setup();
      const { result } = renderHook(() => useDeleteTravelTask("u1"), { wrapper });

      await act(() => result.current.mutateAsync("t1"));

      expect(deleteTravelTask).toHaveBeenCalledWith("t1");
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ["travelTasks", "u1"] });
    });

    it("does not invalidate when there is no user id", async () => {
      const { invalidate, wrapper } = setup();
      const { result } = renderHook(() => useDeleteTravelTask(undefined), { wrapper });

      await act(() => result.current.mutateAsync("t1"));

      expect(invalidate).not.toHaveBeenCalled();
    });
  });

  describe("useUpdateTravelTask", () => {
    const key = ["travelTasks", "u1"];

    it("optimistically applies the change to the cached list before the server answers", async () => {
      const { queryClient, wrapper } = setup();
      let finish!: () => void;
      vi.mocked(updateTravelTask).mockReturnValue(new Promise<void>((r) => (finish = r)));
      queryClient.setQueryData(key, [
        makeTravelTask({ id: "t1" }),
        makeTravelTask({ id: "t2", title: "Other" }),
      ]);
      const { result } = renderHook(() => useUpdateTravelTask("u1"), { wrapper });
      const dueDate = new Date(2026, 5, 1);

      act(() => {
        result.current.mutate({
          taskId: "t1",
          input: {
            title: "Renamed",
            description: "d",
            priority: "high",
            status: "completed",
            dueDate,
            completedAt: new Date(2026, 5, 2),
          },
        });
      });

      await waitFor(() => {
        const [first, second] = queryClient.getQueryData<ReturnType<typeof makeTravelTask>[]>(key)!;
        expect(first).toMatchObject({
          title: "Renamed",
          description: "d",
          priority: "high",
          status: "completed",
          dueDate,
        });
        expect(second.title).toBe("Other");
      });
      await act(async () => finish());
    });

    it("clears due and completion dates optimistically when null is passed", async () => {
      const { queryClient, wrapper } = setup();
      let finish!: () => void;
      vi.mocked(updateTravelTask).mockReturnValue(new Promise<void>((r) => (finish = r)));
      queryClient.setQueryData(key, [
        makeTravelTask({ id: "t1", dueDate: new Date(), completedAt: new Date() }),
      ]);
      const { result } = renderHook(() => useUpdateTravelTask("u1"), { wrapper });

      act(() => {
        result.current.mutate({ taskId: "t1", input: { dueDate: null, completedAt: null } });
      });

      await waitFor(() => {
        const [task] = queryClient.getQueryData<ReturnType<typeof makeTravelTask>[]>(key)!;
        expect(task.dueDate).toBeUndefined();
        expect(task.completedAt).toBeUndefined();
      });
      await act(async () => finish());
    });

    it("rolls back the optimistic change when the update fails", async () => {
      const { queryClient, wrapper } = setup();
      const original = [makeTravelTask({ id: "t1", status: "open" })];
      queryClient.setQueryData(key, original);
      vi.mocked(updateTravelTask).mockRejectedValue(new Error("nope"));
      vi.mocked(getTravelTasks).mockResolvedValue(original);
      const { result } = renderHook(() => useUpdateTravelTask("u1"), { wrapper });

      act(() => result.current.mutate({ taskId: "t1", input: { status: "completed" } }));

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(queryClient.getQueryData<typeof original>(key)![0].status).toBe("open");
    });

    it("refreshes the list after the update settles", async () => {
      const { invalidate, wrapper } = setup();
      const { result } = renderHook(() => useUpdateTravelTask("u1"), { wrapper });

      await act(() => result.current.mutateAsync({ taskId: "t1", input: { title: "x" } }));

      expect(updateTravelTask).toHaveBeenCalledWith("t1", { title: "x" });
      expect(invalidate).toHaveBeenCalledWith({ queryKey: key });
    });

    it("still sends the update without touching caches when there is no user id", async () => {
      const { invalidate, wrapper } = setup();
      const { result } = renderHook(() => useUpdateTravelTask(undefined), { wrapper });

      await act(() => result.current.mutateAsync({ taskId: "t1", input: { title: "x" } }));

      expect(updateTravelTask).toHaveBeenCalled();
      expect(invalidate).not.toHaveBeenCalled();
    });
  });
});
