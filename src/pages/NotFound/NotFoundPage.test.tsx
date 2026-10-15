import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { NotFoundPage } from "./NotFoundPage";
import { notFoundMessages } from "./messages/notFoundMessages";

describe("NotFoundPage", () => {
  it("renders the not-found messages", () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(notFoundMessages.title)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: notFoundMessages.subTitle }),
    ).toBeInTheDocument();
    expect(screen.getByText(notFoundMessages.description)).toBeInTheDocument();
  });

  it("links back to the dashboard", () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("link", { name: notFoundMessages.returnToDashboard }),
    ).toHaveAttribute("href", "/dashboard");
  });
});
