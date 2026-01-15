import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import FriendProfile from "../FriendProfile";
import type { UserDto } from "../../types";

const mockGetUser = vi.fn();

vi.mock("../../api/user/getUser", () => ({
  GetUser: (userId: string) => mockGetUser(userId),
}));

describe("FriendProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a loading state before user data arrives", () => {
    mockGetUser.mockReturnValue(new Promise(() => {}));

    render(<FriendProfile userId="user-1" />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders user details and fallback about text", async () => {
    const user: UserDto = {
      userName: "TestUser",
      firstName: "Test",
      lastName: "User",
      age: 25,
      about: "",
      profilePicturePath: null,
    };

    mockGetUser.mockResolvedValue(user);

    render(<FriendProfile userId="user-1" />);

    expect(await screen.findByText("TestUser")).toBeInTheDocument();
    expect(screen.getByText("Test User, 25 years")).toBeInTheDocument();
    expect(screen.getByText("No description yet.")).toBeInTheDocument();
  });
});
