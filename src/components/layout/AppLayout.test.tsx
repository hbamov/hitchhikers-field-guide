import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../../features/auth/context/AuthContext";
import { makeAppUser } from "../../test/factories";
import { renderWithProviders } from "../../test/renderWithProviders";
import { AppLayout } from "./AppLayout";

vi.mock("../../features/auth/context/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("../../features/loungeChat/services/chat.service", () => ({
  subscribeToChatMessages: vi.fn(() => () => {}),
  sendChatMessage: vi.fn(),
}));

function mockAuth(role: "traveler" | "administrator", signOutUser = vi.fn().mockResolvedValue(undefined)) {
  vi.mocked(useAuth).mockReturnValue({
    user: makeAppUser({ role }),
    loading: false,
    signOutUser,
  } as unknown as ReturnType<typeof useAuth>);
  return signOutUser;
}

function renderLayout() {
  return renderWithProviders(
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<div>Dashboard content</div>} />
      </Route>
      <Route path="/login" element={<div>Login page</div>} />
    </Routes>,
    { route: "/dashboard" },
  );
}

describe("AppLayout", () => {
  beforeEach(() => vi.resetAllMocks());

  it("shows the primary navigation, the user's name and the page content", () => {
    mockAuth("traveler");

    renderLayout();

    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(nav).toHaveTextContent("Dashboard");
    expect(screen.getByRole("link", { name: "Guide" })).toHaveAttribute("href", "/guide");
    expect(screen.getByRole("link", { name: "Checklist" })).toHaveAttribute("href", "/tasks");
    expect(screen.getByText("Arthur Dent")).toBeInTheDocument();
    expect(screen.getByText("Dashboard content")).toBeInTheDocument();
  });

  it("hides the admin link from travelers", () => {
    mockAuth("traveler");

    renderLayout();

    expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument();
  });

  it("shows the admin link to administrators", () => {
    mockAuth("administrator");

    renderLayout();

    expect(screen.getByRole("link", { name: "Admin" })).toHaveAttribute("href", "/admin/guide");
  });

  it("signs out, clears cached data and returns to the login page", async () => {
    const user = userEvent.setup();
    const signOutUser = mockAuth("traveler");
    const { queryClient } = renderLayout();
    queryClient.setQueryData(["travelTasks", "user-1"], [{ id: "private" }]);

    await user.click(screen.getAllByRole("button", { name: "Sign out" })[0]);

    await waitFor(() => expect(signOutUser).toHaveBeenCalledOnce());
    expect(await screen.findByText("Login page")).toBeInTheDocument();
    expect(queryClient.getQueryData(["travelTasks", "user-1"])).toBeUndefined();
  });
});
