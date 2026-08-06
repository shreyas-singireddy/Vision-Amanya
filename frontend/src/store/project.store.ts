/** Project store — UI state for the project domain.
 *
 * Server data is cached by TanStack Query; this store holds only transient
 * client state (filters, selected project, view mode).
 */

import { create } from "zustand";

import type { Project, ProjectListParams } from "@domain/project";

interface ProjectState {
  /** The current filters for the project list screen. */
  filters: ProjectListParams;
  /** The project currently open in a drawer/modal, if any. */
  selectedProject: Project | null;
  viewMode: "grid" | "list";

  setFilters: (filters: Partial<ProjectListParams>) => void;
  resetFilters: () => void;
  selectProject: (project: Project | null) => void;
  setViewMode: (mode: "grid" | "list") => void;
}

const defaultFilters: ProjectListParams = {
  page: 1,
  page_size: 12,
};

export const useProjectStore = create<ProjectState>()((set) => ({
  filters: defaultFilters,
  selectedProject: null,
  viewMode: "grid",

  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters, page: 1 } })),
  resetFilters: () => set({ filters: defaultFilters }),
  selectProject: (project) => set({ selectedProject: project }),
  setViewMode: (viewMode) => set({ viewMode }),
}));
