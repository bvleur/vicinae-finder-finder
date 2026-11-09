import {
  Action,
  ActionPanel,
  Icon,
  List,
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
} from "./finder";

export default function Command() {
  const { alwaysShowList } = getPreferenceValues<{ alwaysShowList?: boolean }>();
  const [windows, setWindows] = useState<FinderWindow[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const found = await listWindows();
        // Nothing to choose between: act immediately, no interaction needed.
        if (!alwaysShowList && found.length <= 1) {
          await closeMainWindow();
          await focusFinder();
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
      await focusWindow(w.id);
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
              <Action title="Focus Finder" onAction={async () => { await closeMainWindow(); await focusFinder(); }} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
