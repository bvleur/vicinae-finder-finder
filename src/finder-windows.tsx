import {
  Action,
  ActionPanel,
  Icon,
  List,
  LaunchProps,
  closeMainWindow,
  getPreferenceValues,
  showHUD,
} from "@vicinae/api";
import { useEffect, useState } from "react";
import {
  FinderWindow,
  describeError,
  focusFinder,
  focusWindow,
  listWindows,
  mergeAllWindows,
  focusGuard,
} from "./finder";

export default function Command(props: LaunchProps) {
  const { alwaysShowList } = getPreferenceValues<{ alwaysShowList?: boolean }>();
  const passed = props.launchContext?.windows;
  const [windows, setWindows] = useState<FinderWindow[] | null>(() => {
    try {
      return typeof passed === "string" ? (JSON.parse(passed) as FinderWindow[]) : null;
    } catch {
      return null;
    }
  });

  const merge = async () => {
    await closeMainWindow();
    try {
      await mergeAllWindows();

    } catch (error) {
      await showHUD(describeError(error));
    }
  };

  useEffect(() => {
    if (windows !== null) return; // handed over by the no-view command
    (async () => {
      try {
        const found = await listWindows();
        // Nothing to choose between: act immediately, no interaction needed.
        if (!alwaysShowList && found.length <= 1) {
          await closeMainWindow();
          await focusGuard(focusFinder);
          return;
        }
        setWindows(found);
      } catch (error) {
        await closeMainWindow();
        await showHUD(describeError(error));
      }
    })();
  }, []);

  const pick = async (w: FinderWindow) => {
    await closeMainWindow();
    try {
      await focusGuard(() => focusWindow(w.id));
    } catch (error) {
      await showHUD(describeError(error));
    }
  };

  return (
    <List isLoading={windows === null} searchBarPlaceholder="Filter Finder windows…">
      {(windows ?? []).map((w) => (
        <List.Item
          key={w.id}
          title={w.name}
          subtitle={w.path.replace(/^\/Users\/[^/]+/, "~")}
          icon={Icon.Folder}
          actions={
            <ActionPanel>
              <Action title="Focus Window" onAction={() => pick(w)} />
              <Action title="Focus Finder" onAction={async () => { await closeMainWindow(); await focusGuard(focusFinder); }} />
            </ActionPanel>
          }
        />
      ))}
      {windows && windows.length > 1 && (
        <List.Item
          key="merge"
          title="Merge all windows into one"
          icon={Icon.Layers}
          actions={
            <ActionPanel>
              <Action title="Merge All Windows" onAction={merge} />
            </ActionPanel>
          }
        />
      )}
    </List>
  );
}
