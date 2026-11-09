import { LaunchType, closeMainWindow, launchCommand, showHUD } from "@vicinae/api";
import { describeError, focusFinder, focusWindow, listWindows, settle } from "./finder";

// No-view entry point (assign the hotkey to this one): acts immediately for 0/1
// windows without ever rendering a view, and hands over to the list otherwise.
export default async function Command() {
  try {
    const windows = await listWindows();
    if (windows.length > 1) {
      await launchCommand({
        name: "finder-windows",
        type: LaunchType.UserInitiated,
        context: { windows: JSON.stringify(windows) },
      });
      return;
    }
    await closeMainWindow();
    await settle();
    if (windows.length === 1) await focusWindow(windows[0].id);
    else await focusFinder();
  } catch (error) {
    await closeMainWindow();
    await showHUD(describeError(error));
  }
}
