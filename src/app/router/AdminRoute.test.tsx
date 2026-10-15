import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeAppUser } from "../../test/factories";
import { useAuth } from "../../features/auth/context/AuthContext";
import { AdminRoute } from "./AdminRoute";

vi.mock("../../features/auth/context/AuthContext", () => ({ useAuth: vi.fn() }));

function mockAuth(value: { user: ReturnType<typeof makeAppUser> | null; loading?: boolean }) {
  vi.mocked(useAuth).mockReturnValue({
    loading: false,
    ...value,
  } as unknown as ReturnType<typeof useAuth>);
}

function renderAdminRoute() {
  return render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<div>Admin content</div>} />
        </Route>
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AdminRoute", () => {
  beforeEach(() => vi.resetAllMocks());

  it("shows a progress indicator and no content while auth loads", () => {
    mockAuth({ user: null, loading: true });

    renderAdminRoute();

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
  });

  it("redirects signed-out visitors to the login page", () => {
    mockAuth({ user: null });

    renderAdminRoute();

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("tells a non-admin they lack permission and hides the content", () => {
    mockAuth({ user: makeAppUser({ role: "traveler" }) });

    renderAdminRoute();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "You do not have permission to access this page.",
    );
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
  });

  it("renders the content for an administrator", () => {
    mockAuth({ user: makeAppUser({ role: "administrator" }) });

    renderAdminRoute();

    expect(screen.getByText("Admin content")).toBeInTheDocument();
  });
});
