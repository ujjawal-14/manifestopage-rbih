"use client";

import FoilMedallions from "./FoilMedallions";
import { useVisible } from "../config/visibility";

/**
 * Client wrapper so the side gold-foil medallions can be toggled at runtime
 * (the "S" key) from inside the server-rendered layout.
 */
export default function SideMedallions() {
  return useVisible("sideMedallions") ? <FoilMedallions /> : null;
}
