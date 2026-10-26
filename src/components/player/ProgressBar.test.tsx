import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, jest } from "@jest/globals";
import { ProgressBar } from "./ProgressBar";

describe("thumbnail preview layout", () => {
  it("renders the final sample cue as a fill image within its reserved frame", () => {
    render(
      <ProgressBar
        currentTime={9}
        duration={10}
        buffered={[]}
        thumbnails={[
          { start: 8, end: 10, src: "/images/thumbnails/sample-5.jpg" },
        ]}
        onSeek={jest.fn()}
        onScrubbingChange={jest.fn()}
      />,
    );
    fireEvent.focus(screen.getByRole("slider", { name: "Seek" }));
    const image = screen.getByTestId("seek-preview").querySelector("img");
    expect(image).toHaveAttribute(
      "src",
      expect.stringContaining("/images/thumbnails/sample-5.jpg"),
    );
    expect(image).toHaveAttribute("data-nimg", "fill");
    expect(image).not.toHaveAttribute("width");
    expect(image).not.toHaveAttribute("height");
    expect(image?.parentElement).toHaveClass("player-thumbnail-frame");
    expect(image).toHaveStyle({
      position: "absolute",
      width: "100%",
      height: "100%",
    });
  });
});
