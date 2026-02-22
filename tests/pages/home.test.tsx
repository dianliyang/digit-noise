import { render, screen } from "@testing-library/react";
import HomePage from "../../app/page";

test("renders headline", () => {
  render(<HomePage />);
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /i design and build digital spaces/i,
    })
  ).toBeInTheDocument();
});

test("renders location copy", () => {
  render(<HomePage />);
  expect(screen.getByText(/currently based in kiel/i)).toBeInTheDocument();
});

test("renders quiet web copy", () => {
  render(<HomePage />);
  expect(screen.getByText(/making the web a quieter place/i)).toBeInTheDocument();
});
