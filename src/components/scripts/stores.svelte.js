class DropStore {
    /** @type {DropItem[]} */
    items = $state([]);
}

export let dropStore = new DropStore();

class AppStates {
    ROOT_NAME = "Pocket_#Drive";
    ROOT_ID = $state("appDataFolder");
    selected = $state();
    isLoggedin = $state(false);
    autoLink = $state(true);
    autoSave = $state(true);
    dropItems = $state([]);
    link = $state("");
}

export let states = new AppStates();
