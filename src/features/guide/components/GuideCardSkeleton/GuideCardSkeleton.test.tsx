import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GuideCardSkeleton } from "./GuideCardSkeleton";

describe("GuideCardSkeleton", () => {
  it("renders a placeholder card hidden from assistive technology", () => {
    const { container } = render(<GuideCardSkeleton />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});
