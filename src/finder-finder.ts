import { LaunchType, closeMainWindow, launchCommand, showHUD } from "@vicinae/api";
import { describeError, focusFinder, focusGuard, focusWindow, listWindows, trace } from "./finder";

// No-view entry point (assign the hotkey to this one): acts immediately for 0/1
// windows without ever rendering a view, and hands over to the list otherwise.
export default async function Command() {
  try {
    trace("command start");
    const windows = await listWindows();
    trace(`listed ${windows.length}`);
    if (windows.length > 1) {
      trace("launching list");
      await launchCommand({
        name: "finder-windows",
        type: LaunchType.UserInitiated,
        context: { windows: JSON.stringify(windows) },
      });
      return;
    }
    await closeMainWindow();
    trace("closed launcher");
    await focusGuard(() => (windows.length === 1 ? focusWindow(windows[0].id) : focusFinder()));
  } catch (error) {
    await closeMainWindow();
    await showHUD(describeError(error));
  }
}
