/** Barrel export for the services layer. */

export { AuthService, authService } from "./auth.service";
export { ProjectService, projectService } from "./project.service";
export { PropertyService, propertyService } from "./property.service";
export { FavouriteService, favouriteService } from "./favourite.service";
export { EnquiryService, enquiryService } from "./enquiry.service";
export { AssistantService, assistantService } from "./assistant.service";
export { bffLogin, bffRegister, bffRefresh, bffLogout } from "./bff-auth.service";
export type { BffAuthResponse, BffAuthResult, BffAuthError } from "./bff-auth.service";
