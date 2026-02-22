import { render, screen } from "@testing-library/react";
import PortfolioPage from "../../app/portfolio/page";

test("renders Selected Works heading", () => {
  render(<PortfolioPage />);
  expect(
    screen.getByRole("heading", { level: 2, name: /selected works/i })
  ).toBeInTheDocument();
});

test("renders all three portfolio items", () => {
  render(<PortfolioPage />);
  expect(screen.getByText("Typeface Analytics")).toBeInTheDocument();
  expect(screen.getByText("Monochrome Theme")).toBeInTheDocument();
  expect(screen.getByText("Ockham")).toBeInTheDocument();
});

test("renders role labels", () => {
  render(<PortfolioPage />);
  expect(screen.getByText("Design & Engineering")).toBeInTheDocument();
  expect(screen.getByText("Creator")).toBeInTheDocument();
  expect(screen.getByText("Lead Developer")).toBeInTheDocument();
});

test("renders year for each item", () => {
  render(<PortfolioPage />);
  expect(screen.getByText("2025")).toBeInTheDocument();
});
