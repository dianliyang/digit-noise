import { render, screen } from "@testing-library/react";
import HomePage from "../../app/page";

test("renders headline", () => {
  render(<HomePage />);
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /i design and build digital experiences/i,
    })
  ).toBeInTheDocument();
});

test("renders location copy", () => {
  render(<HomePage />);
  expect(screen.getByText(/currently based in germany/i)).toBeInTheDocument();
});

test("renders bio copy", () => {
  render(<HomePage />);
  expect(screen.getByText(/reducing unnecessary complexity/i)).toBeInTheDocument();
});
