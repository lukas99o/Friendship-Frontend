import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dropdown from "../Dropdown";

const mockGetInterests = vi.fn();

vi.mock("../../api/interests", () => ({
  getInterests: () => mockGetInterests(),
}));

describe("Dropdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows placeholder when no interests are selected", () => {
    mockGetInterests.mockResolvedValue([]);

    render(<Dropdown selectedInterests={[]} onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Select interests" })).toBeInTheDocument();
  });

  it("renders interests and toggles selection", async () => {
    mockGetInterests.mockResolvedValue(["Music", "Sports"]);
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Dropdown selectedInterests={[]} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Select interests" }));

    expect(await screen.findByLabelText("Music")).toBeInTheDocument();
    expect(screen.getByLabelText("Sports")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Music"));
    expect(onChange).toHaveBeenCalledWith(["Music"]);
  });
});
