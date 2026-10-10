import { PROJECTS, STUDIO_ITEMS, AWARDS } from '../data/profile';

// Content is bundled locally (src/data/profile.js) - no CMS round-trip.
export const useGalleryProjects = () => PROJECTS;
export const useStudioContent = () => STUDIO_ITEMS;
export const useAwards = () => AWARDS;
