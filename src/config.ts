import { workspace } from "vscode";

export default {
  editorAlwaysPresentEnabled: () => {
    const config = getConfig();
    const isEnabled = config.get<boolean>("editorAlwaysPresent");

    return Boolean(isEnabled);
  },
  editorAutoWidthEnabled: () => {
    const config = getConfig();
    const isEnabled = config.get<boolean>("editorAutoWidth");

    return Boolean(isEnabled);
  },
  autoSidebarEnabled: () => {
    const config = getConfig();
    const isEnabled = config.get<boolean>("autoSidebar");

    return Boolean(isEnabled);
  },
};

function getConfig() {
  return workspace.getConfiguration("florencio");
}
