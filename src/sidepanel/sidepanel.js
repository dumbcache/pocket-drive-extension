import "./sidepanel.css";
import App from "./Sidepanel.svelte";
import { mount } from "svelte";

mount(App, {
    target: document.getElementById("app"),
});
