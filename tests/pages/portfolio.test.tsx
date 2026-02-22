import { render, screen } from "@testing-library/react";
import PortfolioPage from "../../app/portfolio/page";

test("renders Selected Works heading", () => {
  render(<PortfolioPage />);
  expect(
    screen.getByRole("heading", { level: 2, name: /selected works/i })
  ).toBeInTheDocument();
});

test("renders portfolio item title", () => {
  render(<PortfolioPage />);
  expect(screen.getByText("Upcoming Project")).toBeInTheDocument();
});

test("renders role label", () => {
  render(<PortfolioPage />);
  expect(screen.getByText("Design & Engineering")).toBeInTheDocument();
});

test("renders year for item", () => {
  render(<PortfolioPage />);
  expect(screen.getByText("2026")).toBeInTheDocument();
});
