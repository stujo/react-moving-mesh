import { render, screen } from "@testing-library/react";
import MovingMesh from "./index";
import React from "react";

describe("MovingMesh", () => {
  const observeSpy = jest.fn();
  const unobserveSpy = jest.fn();
  const disconnectSpy = jest.fn();

  beforeEach(() => {
    // We mocked "ResizeObserver" to avoid errors in the test environment
    global.ResizeObserver = class MockedResizeObserver {
      observe = observeSpy;
      unobserve = unobserveSpy;
      disconnect = disconnectSpy;
    };
    observeSpy.mockClear();
    unobserveSpy.mockClear();
    disconnectSpy.mockClear();
  });

  test("observes resize events", () => {
    render(<MovingMesh />);
    // Check the component signs up for resize events
    expect(observeSpy).toHaveBeenCalledTimes(1);
    expect(disconnectSpy).toHaveBeenCalledTimes(0);
  });

  test("disconnects when unmounted", () => {
    const { unmount } = render(<MovingMesh />);
    expect(observeSpy).toHaveBeenCalledTimes(1);
    unmount();
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });
});
